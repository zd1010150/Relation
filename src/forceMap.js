'use strict';

function ForceMap(options) {
    var container = options.container || document.body,
    width = options.width || 1400,
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
        .linkDistance(function (d) { // 节点之间的距离，默认为130。距离的权重越大，距离越小，d.weight值约定在[0-100]
            return 300 - (~~d.weight);
        })
        .charge(-150) // 节点之间排斥（负数）力度
        .size([width, height])
        .start();
    force.drag()
        .on("dragstart", function (d) {
            d.fixed = true;
        });


    var linkTip = d3.tip()
        .attr('class', 'link-tip')
        .offset([10, 10])
        .html(function (d) {
            return '<strong>' + d.name + '</strong>';
        });
    var linkTipTimer;
    svg.call(linkTip);

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
        });
    // 辅助事件线，细线很难选择触发事件，这个辅助线是透明的宽线。就这点用
    var eventlinks = svg.selectAll('.event-line')
        .data(linksData)
        .enter()
        .append('line')
        .attr('class', 'event-line')
        .on('mouseover', function (d) {
            d.involed = true;
            render();
            if (linkTipTimer) {
                clearTimeout(linkTipTimer);
            }
            linkTip.show(d);
        })
        .on('mouseout', function (d) {
            d.involed = false;
            render();
            if (linkTipTimer) {
                clearTimeout(linkTipTimer);
            }
            linkTipTimer = setTimeout(function () {
                linkTip.hide(d);
            }, 300);
        });

// --------------------------------

    var nodeTip = d3.tip()
        .attr('class', 'node-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<span style='color:red'>" + d.name + "</span>";
        });
    var nodeTipTimer;
    svg.call(nodeTip);
    var nodes = svg.selectAll('.node')
        .data(nodesData)
        .enter()
        .append('g')
        .attr('class', function (d) {
            var classNames = ['node'];
            if (d.category) {
                var tempt= d.category=='男'?'male':'female';
                classNames.push('group-' +tempt);
            }
            return classNames.join(' ');
        })
        .call(force.drag)
        .on('mouseover', function (d) {
            d3.select(this).classed('primary', true);
            hightlightLinked(d.id);
            if (nodeTipTimer) {
                clearTimeout(nodeTipTimer);
            }
            nodeTip.show(d);
        })
        .on('mouseout', function (d) {
            clearHighligt();
            d3.select(this).classed('primary', false);
            if (nodeTipTimer) {
                clearTimeout(nodeTipTimer);
            }
            nodeTipTimer = setTimeout(function () {
                nodeTip.hide(d);
            }, 300);
        });
    // 插入 pattern 用于节点绘制圆形
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
            return "http://10.19.199.110:2100"+d.symbol;
            //return "";
        })
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 40)
        .attr('height', 40);

    nodes.append("circle")
        .attr("xlink:href", function (d) {
            return "http://10.19.199.110:2100"+d.symbol;
            //return "";
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
        setLinePosition(links);
        setLinePosition(eventlinks);

        nodes.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    });
    /**
     * [setLinePosition 设置连线的坐标，力图通用]
     */
    function setLinePosition(lines) {
        lines.attr("x1", function(d) {
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
    }

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
    /**
     * [clearHighligt 清楚高亮]
     */
    function clearHighligt () {
        nodesData.forEach(function (item) {
            item.involed = false;
        });
        linksData.forEach(function (item) {
            item.involed = false;
        });
        render();
    }

    function render () { // 根据是否高亮重绘
        function renderEle (selectors) {
            selectors.attr('class', function(d) {
                var classNames = this.classList;
                if (d.involed) {
                    this.classList.add('involed'); // 关联
                } else {
                    this.classList.remove('involed');
                }
                return this.classList;
            });
        }
        renderEle(svg.selectAll('.node'));
        renderEle(svg.selectAll('.link'));

    }

    /**
     * [findLinkedNodesById 根据node id 查找links 相关联的node]
     * @param  {[String]} id [Node id]
     * @return {[Array]}    [Node数组]
     */
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
