import moment from "moment";

const CATEGORY = ["unproductive", "productive", "neutral"];

export const CandleData = (candleStart, candleLast, date) => {
  let startTime = moment(candleStart, "hours"),
    endTime = startTime;
  var sticks = [startTime.format("HH:mm")];
  var limitDate = moment(date).isSame(moment(), "date")
    ? moment.now()
    : moment(candleLast, "hours").add(24, "hour");
  while (endTime.isBefore(limitDate) || sticks.length < 30) {
    endTime = endTime.add(10, "minutes");
    sticks.push(endTime.format("HH:mm"));
  }
  return sticks;
};

function timeStringToSecs(data) {
  var a = data.split(":"); // split it at the colons
  if (a.length < 3) {
    a[2] = "00";
  }
  var seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2]; // 495 / 60 = 8.25 |
  return seconds;
}

/**
 * Get the index of the stick for an item
 * @date 12/23/2023 - 3:55:34 PM
 *
 * @param {*} itemTime
 * @param {*} sticks
 * @returns {{ index: number; secs: number; }}
 */
function getStickIndex(itemTime, sticks) {
  var itemSecs = timeStringToSecs(itemTime);
  var firstTick = timeStringToSecs(sticks[0].label);
  var diffSecs = itemSecs - firstTick;
  var index = Math.floor(diffSecs / 600);
  var remainder = diffSecs % 600;
  return { index: index, secs: remainder };
}

/**
 * Calculates the duration of an item in seconds
 * @date 12/23/2023 - 3:53:28 PM
 *
 * @param {any} startTime
 * @param {any} endTime
 * @returns {number}
 */
function getItemDuration(startTime, endTime) {
  var startSecs = timeStringToSecs(startTime);
  var endSecs = timeStringToSecs(endTime);
  var duration = endSecs - startSecs;
  return duration;
}

export const secondsToHuman = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  // const remainingSeconds = seconds % 60;

  const hourString = hours > 0 ? `${hours}h` : "";
  const minuteString = minutes > 0 ? `${minutes}m` : "";
  // const secondString = remainingSeconds > 0 ? `${remainingSeconds}s` : "";
  const secondString = ""

  if (hours >= 24) {
    // const days = Math.floor(hours / 24);
    // const remainderHrs = `${hours % 24}h`;
    // return `${days}d ${remainderHrs || "0m"} ${secondString && `${secondString}`
    return `${hourString || "0m"} ${minuteString} ${secondString && `${secondString}`
      }`;
  }

  if (hours > 0) {
    return `${hourString} ${minuteString || "0m"} ${secondString && `${secondString}`
      }`;
  } else if (!hours && minutes > 0) {
    return `${minuteString} ${secondString && `${secondString}`}`;
  }

  return secondString;
};

export const handleAllocateTime = (data, sticks) => {
  let clonedData = [...data];
  let clonedSticks = [...sticks];
  let activity = {
    working: 0,
    idle: 0,
    neutral: 0,
  };

  const idleApps = ['Windows Default Lock Screen', 'Task Switching', 'Desktop']

  clonedData.forEach((d) => {
    if (d.end_time == null) return;
    if (idleApps.includes(d.description)) return;

    var item = getStickIndex(d.time, sticks);
    var initStickAddedTime = 600 - item.secs;
    var itemDuration = getItemDuration(d.time, d.end_time);
    var remainderAddedTime = itemDuration - initStickAddedTime;
    var sticksToFill = Math.floor(remainderAddedTime / 600);
    var remainderToFill = remainderAddedTime % 600;
    var k = parseInt(d.category.is_productive);

    if (!clonedSticks[item.index]) return;

    clonedSticks[item.index].value += initStickAddedTime;
    clonedSticks[item.index].category[CATEGORY[d.category.is_productive]] += initStickAddedTime;

    if (k === 1) {
      activity.working += itemDuration;
    }
    if (k === 2) {
      activity.neutral += itemDuration;
    }

    for (let i = 1; i <= sticksToFill; i++) {
      clonedSticks[item.index + i].value += 600;
      clonedSticks[item.index + i].category[CATEGORY[d.category.is_productive]] += 600;
    }

    if (!clonedSticks[item.index + sticksToFill + 1]) {
      return;
    }

    let indexer = item.index + sticksToFill + 1;
    clonedSticks[indexer].value += remainderToFill;
    clonedSticks[indexer].category[CATEGORY[d.category.is_productive]] += remainderToFill;
  });

  let officeTime = clonedData.length > 0
    ? getItemDuration(clonedData[0].time, clonedData[clonedData.length - 1].end_time ?? clonedData[0].time)
    : 0;

  let poppedSticks = [...clonedSticks];
  for (let index = poppedSticks.length - 1; index > 0; index--) {
    if (poppedSticks[index].value !== 0) break;
    clonedSticks = clonedSticks.slice(0, -1);
  }

  return {
    clonedSticks, activity: {
      working: secondsToHuman(activity.working),
      idle: secondsToHuman(officeTime - (activity.working + activity.neutral)),
    }
  };
}
