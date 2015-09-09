'use strict';
(function () {

})();

// avatarUrl: https://work.alibaba-inc.com/photo/103313.120x120.jpg
// avatarUrl: https://work.alibaba-inc.com/photo/103067.120x120.jpg
var nodes = [{
    id: '103313',
    name: '藤椒',
    group: 1
    // avatarUrl: 'https://github.com/favicon.ico'
}, {
    id: '103067',
    name: '花椒',
    group: 2
    // avatarUrl: 'https://github.com/favicon.ico'
}, {
    id: '103568',
    name: '八角',
    group: 3
    // avatarUrl: 'https://github.com/favicon.ico'
}, {
    id: '103569',
    name: '茴香',
    group: 4
    // avatarUrl: 'https://github.com/favicon.ico'
}, {
    id: '77164',
    name: '大料',
    group: 2
    // avatarUrl: 'https://github.com/favicon.ico'
}, {
    id: '103854',
    name: '胡椒',
    group: 3
    // avatarUrl: 'https://github.com/favicon.ico'
}];

nodes.forEach(function (item) {
    if (item.id) {
        item.avatarUrl = 'https://work.alibaba-inc.com/photo/' + item.id + '.120x120.jpg';
    }
});

var links = [{
    source: '103313',
    target: '103067',
    name: '就不告诉你',
    weight: 100
}, {
    source: '103313',
    target: '103854',
    name: '就不告诉你',
    weight: 20
}, {
    source: '103067',
    target: '103568',
    name: '就不告诉你'
}, {
    source: '103568',
    target: '103569',
    name: '就不告诉你'
}, {
    source: '77164',
    target: '103854',
    name: '就不告诉你'
}];

var options = {
    nodes: nodes,
    links: links,
};

ForceMap(options);
