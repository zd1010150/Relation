'use strict';

function ForceMap(options) {
    var container = options.container || document.body,
    width = options.width || 960,
    height = options.height || 600;
    var nodesData = options.nodes; // distinguish between data and svn dom node
    var linksData = options.links;
    var nodeMap = {};
    nodesData.forEach(function (item, index) {
        nodeMap[item.id] = item;
        item._index = index;
    });
    linksData.forEach(function (item) {
        item.sourceId = item.source;
        item.targetId = item.target;
        item.source = nodeMap[item.sourceId]._index;
        item.target = nodeMap[item.targetId]._index;
    });

    if (nodesData.length === 0) {
        return ;
    }

    var svg = d3.select(container).select('svg').select('g');
    if (svg.size() === 0) {
        svg = d3.select(container).append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g');
    }

    nodesData[0].fixed = true;
    nodesData[0].x = width / 2;
    nodesData[0].y = height / 2;
    var force = d3.layout.force()
        .nodes(nodesData)
        .links(linksData)
        // .gravity(0.05)
        .linkDistance(120)
        .charge(-150)
        .size([width, height])
        .start();
    // paint links first so that put link under the node, link will not trigger mouse event
    var links = svg.selectAll('.link')
        .data(linksData)
        .enter()
        .append('line')
        .attr('class', function(d) {
            var classNames = ['link'];
            if (!d.directed) {
                classNames.push('dotted');
            }
            return classNames.join(' ');
        })
        // .append('text')
        // .text(function (d) {
        //     return d.name;
        // });

    var nodes = svg.selectAll('.node')
        .data(nodesData)
        .enter()
        .append('g')
        .attr('class', function (d) {
            var classNames = ['node'];
            return classNames.join(' ');
        })
        .call(force.drag)
        .on('mouseover', function (d) {
            hightlightLinked(d.id);
        })
        .on('mouseout', function (d) {
            clearHighligt();
        });
    // 插入 pattern
    var defs = svg.append('svg:defs')
        .selectAll('.pattern')
        .data(nodesData)
        .enter()
        .append('svg:pattern')
        .attr('id', function (d) {
            return 'pattern_' + d.id;
        })
        .attr('width', '40')
        .attr('height', '40')
        .append('svg:image')
        .attr('xlink:href', function (d) {
            return d.avatarUrl;
        })
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 40)
        .attr('height', 40);

    nodes.append("circle")
        .attr("xlink:href", function (d) {
            return d.avatarUrl;
        })
        .attr("x", 0)
        .attr("y", 0)
        .attr("r", 20)
        .style("fill", function (d) {
            return 'url(#' + 'pattern_' + d.id + ')';
        });

    nodes.append('text')
        .attr('dx', '-1em')
        .attr('y', '3em')
        .text(function(d) {
            return d.name;
        });

    force.on("tick", function() {
        links.attr("x1", function(d) {
            return d.source.x;
        })
        .attr("y1", function(d) {
            return d.source.y;
        })
        .attr("x2", function(d) {
            return d.target.x;
        })
        .attr("y2", function(d) {
            return d.target.y;
        });

        nodes.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    });

    /**
     * [hightlightLinked 高亮相邻节点和连续]
     * @param  {[String]} id [节点id]
     */
    function hightlightLinked (id) {
        var linedNodes = findLinkedNodesById(id);
        linedNodes.forEach(function (item) {
            item.involed = true;
        });
        render();
    }

    function clearHighligt () {
        nodesData.forEach(function (item) {
            item.involed = false;
        });
        linksData.forEach(function (item) {
            item.involed = false;
        });
        render();
    }

    function render () {
        svg.selectAll('.node')
            .attr('class', function(d) {
                var classNames = ['node'];
                if (d.involed) {
                    classNames.push('involed');
                }
                return classNames.join(' ');
            });
        svg.selectAll('.link')
            .attr('class', function(d) {
                var classNames = ['link', 'dotted'];
                if (d.involed) {
                    classNames.push('involed');
                }
                return classNames.join(' ');
            });
    }

    function findLinkedNodesById (id) {
        return linksData.reduce(function (ret, item) {
            if (item.sourceId === id) {
                ret.push(nodeMap[item.targetId]);
                item.involed = true;
            } else if (item.targetId === id){
                 ret.push(nodeMap[item.sourceId]);
                 item.involed = true;
            }
            return ret;
        }, []);
    }

};
