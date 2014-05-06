/**
 * Created by xerxes on 5/3/14.
 */
$(document).ready(function () {
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
            if( given>0 ){
                msg = msg + given + ' Seconds ';
            }
            return msg ;
        })(gg);
    };
    (function () {
        if(_.isUndefined(localStorage['tSfbid']) === false){
            $('#fb_msg').addClass('hide');
        }else{
            $('#fb_msg').removeClass('hide');
        }
        var keys, data = [];
        async.series([
            function (callback) {
                keys = _.keys(localStorage);
                callback(null);
            },
            function (callback) {
                async.each(keys, function (cur_key, _callback) {
                    if (cur_key.substr(0, 7) === 'xerxes-') {
                        data.push([ cur_key.substr(7), parseFloat(localStorage[cur_key]) ]);
                    }
                    _callback(null);
                }, function (err) {
                    callback(null);
                })
            }

        ], function (err, result) {
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
        });
    })()
});