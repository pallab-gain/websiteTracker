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
                if (given > 0) {
                    msg = msg + given + ' Seconds ';
                }
                return msg;
            })(gg);
        };

        function fetch_data(start_date, end_date, userid) {
            var d = $.Deferred();
            jQuery.ajax({
                'type': 'POST',
                'url': "http://localhost:3000/gettimespent",
                'data': {'start_date': start_date, 'end_date': end_date, 'userid': userid},
                'async': false,
                'success': function (data) {
                    console.log('successfully update data', data);
                    d.resolve(data);
                }
            });
            return d.promise();
        }


        function get_data(data_type, callback, start_date, end_data, userid) {
            return (function (data_type) {
                if (data_type === 'local') {
                    return callback(localStorage);
                } else {

                }
            })(data_type, start_date, end_data, userid)
        }

        function present(_raw_data) {
            return (function (raw_data) {
                var keys, data = [];
                async.series([
                    function (callback) {
                        keys = _.keys(raw_data);
                        callback(null);
                    },
                    function (callback) {
                        async.each(keys, function (cur_key, _callback) {
                            if (cur_key.substr(0, 7) === 'xerxes-') {
                                data.push([ cur_key.substr(7), parseFloat(raw_data[cur_key]) ]);
                            }
                            _callback(null);
                        }, function (err) {
                            callback(null);
                        })
                    }

                ], function (err, result) {
                    console.log('before build', data);
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
            })(_raw_data);
        }

        (function () {
            if (_.isUndefined(localStorage['tSfbid']) === false) {
                $('#fb_msg').addClass('hide');
                $('#datepicker').removeClass('hide');
            } else {
                $('#fb_msg').removeClass('hide');
                $('#datepicker').addClass('hide');
            }


            $('#reservationtime').focus(function () {
                $('#reservationtime').daterangepicker({format: 'YYYY/MM/DD'}, function (start, end) {
                    start = start.format('YYYY-MM-DD');
                    end = end.format('YYYY-MM-DD')
                    return get_data('server', function (data) {
                        return present(data);
                    }, start, end, localStorage['tSfbid']);
                });
            });
            $('#clear_btn').click(function () {
                $("#reservationtime").val("");
                return get_data('local', function (data) {
                    return present(data);
                });
            })
            return get_data('local', function (data) {
                return present(data);
            });

        })()
    }
)
;