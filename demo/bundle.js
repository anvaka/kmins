(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var kmeans = require('../');

window.onload = function () {
  var points = getPointsFromImage(document.getElementById('scene'));
  var clusterCount = 3;
  var cMatch = window.location.search.match(/q=(\d+)/);
  if (cMatch) {
    var x = Number.parseInt(cMatch[1], 10);
    if (Number.isFinite(x)) clusterCount = x;
  }
  var algorithm = kmeans(points, clusterCount);

  while (algorithm.step()) {}

  var clusters = algorithm.getClusters();
  for (var i = 0; i < clusters.length; ++i) {
    renderCluster(clusters[i]);
  }
};

function renderCluster(cluster) {
  var points = cluster.points;
  var size = Math.ceil(Math.sqrt(points.length));

  var canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  var ctx = canvas.getContext('2d');
  var imgData = ctx.getImageData(0, 0, size, size);
  var pixels = imgData.data;

  for (var i = 0; i < points.length; ++i) {
    var pt = points[i];
    pixels[i * 4 + 0] = pt.x;
    pixels[i * 4 + 1] = pt.y;
    pixels[i * 4 + 2] = pt.z;
    pixels[i * 4 + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);
  document.body.appendChild(canvas);
}

function getPointsFromImage(img) {
  var canvas = document.createElement('canvas');
  var width = canvas.width = img.width;
  var height = canvas.height = img.height;

  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  var points = [];
  var imgData = ctx.getImageData(0, 0, width, height);
  var source = imgData.data;

  for (var i = 0; i < source.length; i += 4) {
    points.push({
      x: source[i],
      y: source[i + 1],
      z: source[i + 2]
    });
  }

  return points;
}

},{"../":2}],2:[function(require,module,exports){
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
  this.centroid = new Point(centroid.x, centroid.y, centroid.z);
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

},{}]},{},[1]);
