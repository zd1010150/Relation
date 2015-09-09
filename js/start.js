
    

require.config({
    paths: {
        echarts: 'http://echarts.baidu.com/build/dist'
    }
});
require(['echarts', 'echarts/chart/force'], function(ec) {
    var myChart = ec.init(document.getElementById('main'));
    var option = {
        title: {
            text: '人物关系：乔布斯',
            subtext: '数据来自人立方',
            x: 'right',
            y: 'bottom'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} : {b}'
        },
        toolbox: {
            show: true,
            feature: {
                restore: {
                    show: true
                },
                magicType: {
                    show: true,
                    type: ['force', 'chord']
                },
                saveAsImage: {
                    show: true
                }
            }
        },
        legend: {
            x: 'left',
            data: ['家人', '朋友']
        },
        series: [{
            type: 'force',
            name: "人物关系",
            ribbonType: false,
            categories: [{
                name: '人物'
            }, {
                name: '家人',
                symbol: 'diamond'
            }, {
                name: '朋友'
            }],
            animation:true,
            itemStyle: {
                normal: {
                    label: {
                        show: true,
                        textStyle: {
                            color: '#333'
                        }
                    },
                    nodeStyle: {
                        brushType: 'both',
                        borderColor: 'rgba(255,215,0,0.4)',
                        borderWidth: 1
                    }
                },
                emphasis: {
                    label: {
                        show: false
                            // textStyle: null      // 默认使用全局文本样式，详见TEXTSTYLE
                    },
                    nodeStyle: {
                        //r: 30
                    },
                    linkStyle: {}
                }
            },
            minRadius: 15,
            maxRadius: 25,
            gravity: 1.1,
            scaling: 1.2,
            draggable: false,
            linkSymbol: 'arrow',
            steps: 10,
            coolDown: 0.9,
            //preventOverlap: true,
            nodes: nodes,
            links: links
        }]
    };
    myChart.setOption(option);
    var ecConfig = require('echarts/config');

    function focus(param) {
        var data = param.data;
        var links = option.series[0].links;
        var nodes = option.series[0].nodes;
        if (
            data.source != null && data.target != null
        ) { //点击的是边
            var sourceNode = nodes.filter(function(n) {
                return n.name == data.source
            })[0];
            var targetNode = nodes.filter(function(n) {
                return n.name == data.target
            })[0];
            console.log("选中了边 " + sourceNode.name + ' -> ' + targetNode.name + ' (' + data.weight + ')');
        } else { // 点击的是点
            console.log("选中了" + data.name + '(' + data.value + ')');
        }
    }
    myChart.on(ecConfig.EVENT.CLICK, focus)

    myChart.on(ecConfig.EVENT.FORCE_LAYOUT_END, function() {
        console.log(myChart.chart.force.getPosition());
    });

});

