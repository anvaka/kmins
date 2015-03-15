module.exports = kmeans;

function kmeans(points, clustersCount) {
  // todo: validate input
  var data = clone(points);
  var length = data.length;
  var clusters = initClusters();

  return {
    step: step,
    getClusters: getClusters
  };

  function step() {
    for (var i = 0; i < length; ++i) {
      addToNearestCluster(data[i]);
    }
    var changedClusters = recomputeCentroids();
    var hasMoreWork = changedClusters > 0;

    return hasMoreWork;
  }

  function recomputeCentroids() {
    var changedClusters = 0;
    for (var i = 0; i < clustersCount; ++i) {
      changedClusters += clusters[i].recomputeCentroid();
    }
    return changedClusters;
  }

  function addToNearestCluster(pt) {
    var min = Number.POSITIVE_INFINITY;
    var idx = -1;
    for (var i = 0; i < clustersCount; ++i) {
      var dist = clusters[i].distanceTo(pt);
      if (dist < min) {
        min = dist;
        idx = i;
      }
    }

    if (idx !== pt.cluster) {
      if (pt.cluster !== undefined) {
        clusters[pt.cluster].remove(pt);
      }
      clusters[idx].add(pt);
      pt.cluster = idx;
    }
  }

  function getClusters() {
    return clusters;
  }

  function initClusters() {
    // pick first centroids at random.
    // Centroids should be unique
    var clusters = [];
    var maxLength = length - 1;
    var selectedCentroids = Object.create(null);

    while (clustersCount !== clusters.length) {
      var idx = (Math.random() * maxLength) | 0;
      var point = data[idx];
      swap(idx, maxLength);
      if (maxLength === 0) {
        throw new Error('Could not find ' + clustersCount + ' unique data points');
      }

      maxLength -= 1;
      var key = getKey(point);
      if (selectedCentroids[key]) {
        continue; // skip this as centroid, it was already selected before.
      }

      selectedCentroids[key] = 1;
      clusters.push(new Cluster(point));
    }

    return clusters;
  }

  function getKey(p) {
    return '' + p.x + p.y + p.z;
  }

  function swap(a, b) {
    var temp = data[a];
    data[a] = data[b];
    data[b] = temp;
  }
}

function Cluster(centroid) {
  this.centroid = new Point(centroid.x, centroid.y, centroid.y);
  this.points = [];
  this._dirty = false;
}

Cluster.prototype.recomputeCentroid = function () {
  if (!this._dirty) return 0; // no need to change anything
  this._dirty = false;

  var length = this.points.length;
  var cx = 0;
  var cy = 0;
  var cz = 0;

  for (var i = 0; i < length; ++i) {
    var pt = this.points[i];
    cx += pt.x;
    cy += pt.y;
    cz += pt.z;
  }
  cx /= length;
  cy /= length;
  cz /= length;

  this.centroid.x = cx;
  this.centroid.y = cy;
  this.centroid.z = cz;

  return 1;
};

Cluster.prototype.remove = function (pt) {
  var idx = this.points.indexOf(pt);
  if (idx !== -1) {
    this._dirty = true;
    this.points.splice(idx, 1);
  }
};

Cluster.prototype.add = function (pt) {
  this._dirty = true;
  this.points.push(pt);
};

Cluster.prototype.distanceTo = function (pt) {
  return distance(this.centroid, pt);
};

function distance(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  var dz = a.z - b.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function Point(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

function clone(input) {
  return input.map(toPoint);
}

function toPoint(pt) {
  return new Point(pt.x, pt.y, pt.z);
}
