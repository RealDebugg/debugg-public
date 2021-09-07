function getFuzzyPostal(postals, x, y) {
    var temp = {};
    var calculatedAccuracy = 1.25;

    for (postal in postals) {
        let pX = postals[postal].x;
        let pY = postals[postal].y;

        let tX = pX - x;
        let tY = pY - y;
        // Calculate distance from postal
        let dist = Math.sqrt(tX * tX + tY * tY);
        temp[postal] = dist;
    }
    // Populate list of of postal locations
    let items = Object.keys(temp).map(function (key) {
        return [key, temp[key]];
    });
    items.sort(function (first, second) {
        return second[1] - first[1];
    });
    // Only keep the 100 closest
    items.splice(0, 848);
    // Reverse results so closest is first
    temp = items.reverse();

    // Store results
    if (temp.length > 0) {
        var nearestPostal = temp[0][0];
    } else {
        return "";
    }

    // Calculate the density of their location
    let left = Number(nearestPostal.toString().substring(0, 3));
    let accuracy = 5;
    if (left > 450) {
        accuracy = 1;
    } else if (left < 100) {
        accuracy = 3;
    } else if (left < 120) {
        accuracy = 2;
    } else if (left > 240 && left < 300) {
        accuracy = 3;
    }

    // Get an rough area based on density
    if (accuracy > 3) {
        calculatedAccuracy = 1.7;
    }
    let grayArea = accuracy * calculatedAccuracy * 100;

    let fuzzyResults = getFakePostal(postals, x, y, grayArea);
    let fuzzyPostal = fuzzyResults[0];

    return fuzzyPostal;
}

function getFakePostal(postals, x, y, grayArea) {
    let fuzzytemp = {};
    let colX = 0;
    let colY = 0;
    // Gray area
    let minx = x - grayArea;
    let maxx = x + grayArea;
    let miny = y - grayArea;
    let maxy = y + grayArea;

    // Get the average of 5 calculations
    for (var i = 0; i < 5; i++) {
        // Get a random X within range
        let fuzzyX = Math.floor(Math.random() * (maxx - minx + 1) + minx);
        // Get a random Y withing range
        let fuzzyY = Math.floor(Math.random() * (maxy - miny + 1) + miny);
        colX += fuzzyX;
        colY += fuzzyY;
    }
    colX = colX / 5;
    colY = colY / 5;

    // Find nearest postal to fuzzy coords
    for (postal in postals) {
        let pX = postals[postal].x;
        let pY = postals[postal].y;

        let tX = pX - colX;
        let tY = pY - colY;
        // Calculate distance from postal
        let dist = Math.sqrt(tX * tX + tY * tY);
        fuzzytemp[postal] = dist;
    }
    // Populate list of of postal locations
    let fuzzyitems = Object.keys(fuzzytemp).map(function (key) {
        return [key, fuzzytemp[key]];
    });
    fuzzyitems.sort(function (first, second) {
        return second[1] - first[1];
    });
    // Reverse results so closest is first
    fuzzytemp = fuzzyitems.reverse();

    // Return results
    var fuzzyPostal = fuzzytemp[0][0];
    return [fuzzyPostal, Math.round(colX), Math.round(colY)];
}
