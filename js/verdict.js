/**
 * Verdict logic — takes the full state object, returns a plain-language recommendation.
 */
function generateVerdict(state) {
  const costDiff = state.uberCost - state.transitCost;
  const timeDiff = state.transitTime - state.uberTime;
  const costPerMinute = timeDiff > 0 ? costDiff / timeDiff : Infinity;

  // --- Priority multiplier: boost the factor the user cares most about ---
  const boost = (factor) => state.priority === factor ? 1.5 : 1;

  // --- Baseline score: positive = leans rideshare, negative = leans transit ---
  // Start from time savings value minus cost penalty
  let score = 0;

  // Time savings: each minute saved is worth ~1 point, scaled down if small
  if (timeDiff > 0) {
    score += timeDiff * 0.8;
  } else {
    // Transit is faster or equal — strong transit lean
    score -= 20;
  }

  // Cost penalty: each dollar extra for rideshare pulls away from it
  score -= costDiff * 1.2 * boost("money");

  // --- Vibe check adjustments ---

  // Luggage: heavy stuff makes transit worse
  const luggageWeight = { light: 0, moderate: 8, heavy: 18 };
  score += (luggageWeight[state.luggage] || 0) * boost("luggage");

  // Energy: low energy makes transit worse
  const energyWeight = { fine: -5, worn: 6, fumes: 16 };
  score += (energyWeight[state.energy] || 0) * boost("energy");

  // Transit upside: if the trip might be nice, transit gets a boost
  const upsideWeight = { maybe: -12, doubtful: 0, no: 8 };
  score += upsideWeight[state.upside] || 0;

  // --- Dread tax ---
  const dreadWeight = { fine: -5, "rather-not": 10, "absolutely-not": 30 };
  score += dreadWeight[state.dread] || 0;

  // --- Regret test ---
  // This is the big one. If you won't use the time, the rideshare loses value.
  const regretWeight = {
    "use-it": 10,
    decompress: 5,
    phone: -20,
    "no-idea": -8,
  };
  score += (regretWeight[state.regret] || 0) * boost("opportunity");

  // --- Build the verdict ---
  const recommend = score > 5 ? "rideshare" : score < -5 ? "transit" : "toss-up";

  return buildExplanation(recommend, score, state, costDiff, timeDiff, costPerMinute);
}

function buildExplanation(recommend, score, state, costDiff, timeDiff, costPerMinute) {
  const minutes = timeDiff;
  const dollars = costDiff;

  if (recommend === "rideshare") {
    return buildRideshareCase(score, state, dollars, minutes, costPerMinute);
  } else if (recommend === "transit") {
    return buildTransitCase(score, state, dollars, minutes);
  } else {
    return buildTossUp(state, dollars, minutes);
  }
}

function buildRideshareCase(score, state, dollars, minutes, costPerMinute) {
  const parts = [];

  // Opening line
  if (score > 30) {
    parts.push("Take the car. This one isn't close.");
  } else if (state.dread === "absolutely-not") {
    parts.push("Take the car. Your dread is doing most of the talking here, and honestly, it's making a fair point.");
  } else if (state.energy === "fumes") {
    parts.push("Take the car. You're running on empty and transit is going to cost you more than money right now.");
  } else {
    parts.push("Take the car.");
  }

  // Reasoning
  if (minutes > 0 && dollars > 0) {
    if (costPerMinute < 1) {
      parts.push(`You're paying $${dollars.toFixed(0)} extra to save ${minutes} minutes — that's less than a dollar a minute, which is a decent deal.`);
    } else if (costPerMinute < 2) {
      parts.push(`It's $${dollars.toFixed(0)} more for ${minutes} fewer minutes. Not the cheapest trade, but worth it today.`);
    } else {
      parts.push(`Yes, $${dollars.toFixed(0)} extra for ${minutes} minutes is steep on paper.`);
    }
  }

  // What tipped it
  if (state.luggage === "heavy") {
    parts.push("Hauling all that stuff on transit would be miserable.");
  }
  if (state.regret === "use-it") {
    parts.push("Doing something with the extra time is worth the extra money.");
  } else if (state.regret === "decompress") {
    parts.push("Saving your energy is worth the extra money.");
  }

  return parts.join(" ");
}

function buildTransitCase(score, state, dollars, minutes) {
  const parts = [];

  // Opening line
  if (score < -30) {
    parts.push("Take transit. This is a pretty easy one.");
  } else if (state.regret === "phone") {
    parts.push("Take transit. You said you'd just look at your phone with the extra time — you can do that on the bus too, and keep the money.");
  } else if (dollars > 30) {
    parts.push(`Take transit. $${dollars.toFixed(0)} is a lot to pay for what you'd actually get out of it.`);
  } else {
    parts.push("Take transit.");
  }

  // Reasoning
  if (minutes > 0) {
    if (minutes <= 15) {
      parts.push(`You're only saving ${minutes} minutes with the rideshare — barely enough to notice once you get there.`);
    } else {
      parts.push(`Yes, it's ${minutes} extra minutes. But that time isn't worth as much as your gut is telling you right now.`);
    }
  } else {
    parts.push("Transit is actually faster here, so you'd just be paying more to go slower.");
  }

  // Softening if there's upside
  if (state.upside === "maybe") {
    parts.push("The trip might actually be kind of nice. Give it a chance.");
  }

  if (state.dread === "fine") {
    parts.push("And you're barely dreading it at all! Save your money.");
  }

  return parts.join(" ");
}

function buildTossUp(state, dollars, minutes) {
  const parts = [];

  if (minutes > 0) {
    parts.push(`You'd save ${minutes} minutes for $${dollars.toFixed(0)} extra. That's right on the line.`);
  }

  if (state.energy === "fumes") {
    parts.push("You're exhausted, but you said you wouldn't really use the time -- take the car if you need a break, survive the commute if you'll regret scrolling on your phone.");
  } else if (state.dread === "rather-not") {
    parts.push("You're mildly dreading transit but not enough for it to be decisive. Go with whatever your gut said first — before you opened this app.");
  } else {
    parts.push("The numbers don't clearly favor either option. If you're still thinking about it in 30 seconds, take transit. The fact that you're deliberating means the rideshare isn't worth it.");
  }

  return parts.join(" ");
}
