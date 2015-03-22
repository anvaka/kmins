var kmeans = require('../');

window.onload = function () {
  var points = getPointsFromImage(document.getElementById('scene'));

  var algorithm = kmeans(points, 3);

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

  for (var i = 0; i < source.length/4; i += 4) {
    points.push({
      x: source[i * 4],
      y: source[i * 4 + 1],
      z: source[i * 4 + 2]
    });
  }

  return points;
}
