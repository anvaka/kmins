var test = require('tap').test;
var kmeans = require('../');


test('it can compute clusters', function(t) {
  var data = [
    // first cluster
    { x: -10, y: 0, z: 0 },
    { x: -10, y: 0, z: 0 },
    { x: -10, y: 0, z: 0 },

    // second cluster
    { y: -10, x: 0, z: 10 },
    { y: -10, x: 0, z: 12 },
    { y: -10, x: 0, z: 14 },
  ];

  var numberOfClusters = 2;
  var algorithm = kmeans(data, numberOfClusters);
  while (algorithm.step()) {} // iterate until it is done

  var clusters = algorithm.getClusters();
  t.equals(clusters.length, numberOfClusters, 'It has expected number of clusters');

  var firstCluster = clusters[0];
  var secondCluster = clusters[1];

  // since clusters are picked at random, let's assign who is
  // first and who is second:
  if (firstCluster.centroid.y !== 0) {
    secondCluster = clusters[0];
    firstCluster = clusters[1];
  }
  clusterHasPoint(firstCluster, data[0]);
  clusterHasPoint(firstCluster, data[1]);
  clusterHasPoint(firstCluster, data[2]);

  clusterHasPoint(secondCluster, data[3]);
  clusterHasPoint(secondCluster, data[4]);
  clusterHasPoint(secondCluster, data[5]);

  t.end();

  function clusterHasPoint(cluster, pt) {
    var points = cluster.points;
    t.ok(pointInArray(points, pt), 'cluster ' + JSON.stringify(cluster.centroid) +
         ' has point ' + JSON.stringify(pt));
  }
});

function pointInArray(array, p) {
  for (var i = 0; i < array.length; ++i) {
    var a = array[i];
    if (a.x === p.x && a.y === p.y && a.z === p.z) return true;
  }
  return false;
}
