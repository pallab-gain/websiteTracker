/**
 * Created by xerxes on 5/3/14.
 */

var app = angular.module('tabTracker', []);
app.factory('highChart', function () {
    var highChart = {};

    function get_time(gg) {
        var mn = 60, hr = mn * 60, dy = hr * 24, yr = dy * 365, tmp;
        var msg = "";
        return (function (given) {
            if (given >= yr) {
                tmp = Math.floor(given / yr);
                //console.log('yr', tmp);
                msg = msg + tmp + ' Years ';
                given = given - (tmp * yr);
            }
            if (given >= dy) {
                tmp = Math.floor(given / dy);
                //console.log('dy', tmp);
                msg = msg + tmp + ' Days ';
                given = given - (tmp * dy);
            }

            if (given >= hr) {
                tmp = Math.floor(given / hr);
                //console.log('hr', tmp);
                msg = msg + tmp + ' Hours ';
                given = given - (tmp * hr);
            }

            if (given >= mn) {
                tmp = Math.floor(given / mn);
                //console.log('mn', tmp);
                msg = msg + tmp + ' Minutes ';
                given = given - (tmp * mn);
            }
            if (given > 0) {
                msg = msg + given + ' Seconds ';
            }
            return msg;
        })(gg);
    };
    highChart.drawpie = function (data) {
        //console.log(data);
        $('#high_chart_id').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: 'Visit Statistics'
            },
            tooltip: {
                formatter: function () {
                    var msg = this.point.name + '<br/>' +
                        'Time Spent :<b> ' + get_time(this.point.y) + '</b><br/>Percentage: <b>' + this.percentage.toFixed(2) + '</b> % <br/>';
                    return msg;
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false,
                        color: '#000000',
                        connectorColor: '#000000',
                        formatter: function () {
                            /*return Math.round(this.percentage*100)/100 + ' %';*/
                            return '<b>' + this.point.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                        }
                    },
                    showInLegend: true
                }
            },
            credits: {
                enabled: false
            },
            series: [
                {
                    type: 'pie',
                    name: 'Visit Statics',
                    data: data
                }
            ]
        });
    }
    return highChart;
});
app.factory('collectData', function ($http, $q) {
    var collectData = {};
    collectData.collectData = function (raw_data) {
        var d = $q.defer();
        var keys , data = []
        async.series([
            function (get_keys) {
                keys = _.keys(raw_data);
                get_keys(null);
            },
            function (save_data) {
                async.each(keys, function (cur_key, callback1) {
                    if (cur_key.substr(0, 7) === 'xerxes-') {
                        data.push([ cur_key.substr(7), parseFloat(raw_data[cur_key]) ]);
                    }
                    callback1(null);
                }, function (err) {
                    save_data(null);
                });
            }
        ], function (err) {
            collectData.data = data;
            d.resolve();
        });
        return d.promise;
    };
    collectData.getServerData = function (start, end, userid) {
        var d = $q.defer();
        var url = 'http://localhost:3000/gettimespent';
        $http({'method': 'POST', 'url': url, 'data': {'start_date': start, 'end_date': end, 'userid': userid}}).success(function (data, status, headers, config) {
            collectData.serverData = data.result;
            d.resolve();
        })
        return d.promise;
    }
    return collectData;
});
app.controller('tabTrackerCtrl', function ($scope, collectData, highChart) {
    $scope.fbid = localStorage['tSfbid'];
    collectData.collectData(localStorage).then(function () {
        highChart.drawpie(collectData.data);
    });

    $('#reservationtime').focus(function () {
        $('#reservationtime').daterangepicker({format: 'YYYY/MM/DD'}, function (start, end) {
            start = start.format('YYYY-MM-DD');
            end = end.format('YYYY-MM-DD')
            collectData.getServerData(start, end, $scope.fbid).then(function () {
                collectData.collectData(collectData.serverData).then(function () {
                    highChart.drawpie(collectData.data);
                });
            });
        });
    });
    $('#clear_btn').click(function () {
        $("#reservationtime").val("");
        collectData.collectData(localStorage).then(function () {
            highChart.drawpie(collectData.data);
        });
    });
});