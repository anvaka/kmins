var kmeans = require('../');
var loadImage = require('./loadImage.js');

window.onload = function () {
  loadImage('arches.jpg').then(run)
}

function run(image) {
  document.querySelector('#srcImage').appendChild(image);
  var points = getPointsFromImage(image);

  var clusterCount = 3;
  var cMatch = window.location.search.match(/q=(\d+)/);
  if (cMatch) {
    var x = Number.parseInt(cMatch[1], 10);
    if (Number.isFinite(x)) clusterCount = x;
  }

  var algorithm = kmeans(points, clusterCount);

  var counter = 0;
  computeNext()

  function computeNext() {
    while (algorithm.step()) {
      counter += 1;
      if (counter % 10) {
        renderAllClusters(algorithm)
      }
      setTimeout(computeNext, 0);
      return;
    }

    renderAllClusters(algorithm);
  }
}

function renderAllClusters(algorithm) {
  var container = document.querySelector('#clusters');
  container.innerHTML = '';

  var clusters = algorithm.getClusters();
  for (var i = 0; i < clusters.length; ++i) {
    renderCluster(container, clusters[i]);
  }
}

function renderCluster(container, cluster) {
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
  container.appendChild(canvas);
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
      x: source[i + 0],
      y: source[i + 1],
      z: source[i + 2]
    });
  }

  return points;
}
