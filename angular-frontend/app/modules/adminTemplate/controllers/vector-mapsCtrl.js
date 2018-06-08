"use strict";

angular.module('ng-laravel').controller('vector-mapsCtrl',function($scope){
    $scope.gdpData = {
        "AF": 16.63,
        "AL": 11.58,
        "DZ": 158.97,
        "AO": 85.81,
        "AG": 1.1,
        "AR": 351.02,
        "AM": 8.83,
        "AU": 1219.72,
        "AT": 366.26,
        "AZ": 52.17,
        "BS": 7.54,
        "BH": 21.73,
        "BD": 105.4,
        "BB": 3.96,
        "BY": 52.89,
        "BE": 461.33,
        "BZ": 1.43,
        "BJ": 6.49,
        "BT": 1.4,
        "BO": 19.18,
        "BA": 16.2,
        "BW": 12.5,
        "BR": 2023.53,
        "BN": 11.96,
        "BG": 44.84,
        "BF": 8.67,
        "BI": 1.47,
        "KH": 11.36,
        "CM": 21.88,
        "CA": 1563.66,
        "CV": 1.57,
        "CF": 2.11,
        "TD": 7.59,
        "CL": 199.18,
        "CN": 5745.13,
        "CO": 283.11,
        "KM": 0.56,
        "CD": 12.6,
        "CG": 11.88,
        "CR": 35.02,
        "CI": 22.38,
        "HR": 59.92,
        "CY": 22.75,
        "CZ": 195.23,
        "DK": 304.56,
        "DJ": 1.14,
        "DM": 0.38,
        "DO": 50.87,
        "EC": 61.49,
        "EG": 216.83,
        "SV": 21.8,
        "GQ": 14.55,
        "ER": 2.25,
        "EE": 19.22,
        "ET": 30.94,
        "FJ": 3.15,
        "FI": 231.98,
        "FR": 2555.44,
        "GA": 12.56,
        "GM": 1.04,
        "GE": 11.23,
        "DE": 3305.9,
        "GH": 18.06,
        "GR": 305.01,
        "GD": 0.65,
        "GT": 40.77,
        "GN": 4.34,
        "GW": 0.83,
        "GY": 2.2,
        "HT": 6.5,
        "HN": 15.34,
        "HK": 226.49,
        "HU": 132.28,
        "IS": 12.77,
        "IN": 1430.02,
        "ID": 695.06,
        "IR": 337.9,
        "IQ": 84.14,
        "IE": 204.14,
        "IL": 201.25,
        "IT": 2036.69,
        "JM": 13.74,
        "JP": 5390.9,
        "JO": 27.13,
        "KZ": 129.76,
        "KE": 32.42,
        "KI": 0.15,
        "KR": 986.26,
        "UNDEFINED": 5.73,
        "KW": 117.32,
        "KG": 4.44,
        "LA": 6.34,
        "LV": 23.39,
        "LB": 39.15,
        "LS": 1.8,
        "LR": 0.98,
        "LY": 77.91,
        "LT": 35.73,
        "LU": 52.43,
        "MK": 9.58,
        "MG": 8.33,
        "MW": 5.04,
        "MY": 218.95,
        "MV": 1.43,
        "ML": 9.08,
        "MT": 7.8,
        "MR": 3.49,
        "MU": 9.43,
        "MX": 1004.04,
        "MD": 5.36,
        "MN": 5.81,
        "ME": 3.88,
        "MA": 91.7,
        "MZ": 10.21,
        "MM": 35.65,
        "NA": 11.45,
        "NP": 15.11,
        "NL": 770.31,
        "NZ": 138,
        "NI": 6.38,
        "NE": 5.6,
        "NG": 206.66,
        "NO": 413.51,
        "OM": 53.78,
        "PK": 174.79,
        "PA": 27.2,
        "PG": 8.81,
        "PY": 17.17,
        "PE": 153.55,
        "PH": 189.06,
        "PL": 438.88,
        "PT": 223.7,
        "QA": 126.52,
        "RO": 158.39,
        "RU": 1476.91,
        "RW": 5.69,
        "WS": 0.55,
        "ST": 0.19,
        "SA": 434.44,
        "SN": 12.66,
        "RS": 38.92,
        "SC": 0.92,
        "SL": 1.9,
        "SG": 217.38,
        "SK": 86.26,
        "SI": 46.44,
        "SB": 0.67,
        "ZA": 354.41,
        "ES": 1374.78,
        "LK": 48.24,
        "KN": 0.56,
        "LC": 1,
        "VC": 0.58,
        "SD": 65.93,
        "SR": 3.3,
        "SZ": 3.17,
        "SE": 444.59,
        "CH": 522.44,
        "SY": 59.63,
        "TW": 426.98,
        "TJ": 5.58,
        "TZ": 22.43,
        "TH": 312.61,
        "TL": 0.62,
        "TG": 3.07,
        "TO": 0.3,
        "TT": 21.2,
        "TN": 43.86,
        "TR": 729.05,
        "TM": 0,
        "UG": 17.12,
        "UA": 136.56,
        "AE": 239.65,
        "GB": 2258.57,
        "US": 14624.18,
        "UY": 40.71,
        "UZ": 37.72,
        "VU": 0.72,
        "VE": 285.21,
        "VN": 101.99,
        "YE": 30.02,
        "ZM": 15.69,
        "ZW": 5.57
    };
    $scope.vectorMapOption1 = {
        map: 'world_mill_en',
        backgroundColor: 'transparent',
        series: {
            regions: [{
                values: $scope.gdpData, // import data with vendors/jquery-jvectormap/js/data-sample.js
                scale: ['#C8EEFF', '#0071A4'],
                normalizeFunction: 'polynomial'
            }]
        },
        onRegionTipShow: function(e, el, code){
            el.html(el.html()+' (GDP - '+$scope.gdpData[code]+')');
        }
    };

    $scope.vectorMapOption2 = {
        map: 'mall',
        backgroundColor: 'transparent',
        markers: [{
            coords: [60, 110],
            name: 'Escalator 1',
            style: {fill: 'yellow'}
        },{
            coords: [260, 95],
            name: 'Escalator 2',
            style: {fill: 'yellow'}
        },{
            coords: [434, 95],
            name: 'Escalator 3',
            style: {fill: 'yellow'}
        },{
            coords: [634, 110],
            name: 'Escalator 4',
            style: {fill: 'yellow'}
        }],
        series: {
            regions: [{
                values: {
                    F102: 'SPORTS & OUTDOOR',
                    F103: 'HOME DECOR',
                    F105: 'FASHION',
                    F106: 'OTHER',
                    F108: 'BEAUTY & SPA',
                    F109: 'FASHION',
                    F110: 'BEAUTY & SPA',
                    F111: 'URBAN FAVORITES',
                    F114: 'SERVICES',
                    F166: 'DINING',
                    F167: 'FASHION',
                    F169: 'DINING',
                    F170: 'ENTERTAINMENT',
                    F172: 'DINING',
                    F174: 'DINING',
                    F115: 'KIDS STUFF',
                    F117: 'LIFESTYLE',
                    F118: 'URBAN FAVORITES',
                    F119: 'FASHION',
                    F120: 'FASHION',
                    F122: 'KIDS STUFF',
                    F124: 'KIDS STUFF',
                    F125: 'KIDS STUFF',
                    F126: 'KIDS STUFF',
                    F128: 'KIDS STUFF',
                    F129: 'LIFESTYLE',
                    F130: 'HOME DECOR',
                    F132: 'DINING',
                    F133: 'SPORTS & OUTDOOR',
                    F134: 'KIDS STUFF',
                    F135: 'LIFESTYLE',
                    F136: 'LIFESTYLE',
                    F139: 'KIDS STUFF',
                    F153: 'DINING',
                    F155: 'FASHION',
                    F156: 'URBAN FAVORITES',
                    F157: 'URBAN FAVORITES',
                    F158: 'LINGERIE & UNDERWEAR',
                    F159: 'FASHION',
                    F160: 'FASHION',
                    F162: 'FASHION',
                    F164: 'FASHION',
                    F165: 'FASHION',
                    FR01: 'REST ROOMS',
                    FR02: 'REST ROOMS',
                    FR03: 'REST ROOMS',
                    FR04: 'REST ROOMS',
                    FFC: 'DINING'
                },
                scale: {
                    "FASHION": "#2761ad",
                    "LINGERIE & UNDERWEAR": "#d58aa3",
                    "BEAUTY & SPA": "#ee549f",
                    "URBAN FAVORITES": "#15bbba",
                    "SPORTS & OUTDOOR": "#8864ab",
                    "KIDS STUFF": "#ef4e36",
                    "ENTERTAINMENT": "#e47325",
                    "HOME DECOR": "#a2614f",
                    "LIFESTYLE": "#8a8934",
                    "DINING": "#73bb43",
                    "REST ROOMS": "#6c260f",
                    "SERVICES": "#504d7c",
                    "OTHER": "#c7b789"
                }
            }]
        },
        onRegionTipShow: function(e, el, code){
            if (el.html() === '') {
                e.preventDefault();
            }
        }
    };


    $scope.vectorMapOption3 = {
        map: 'us_aea_en',
        backgroundColor: 'transparent',
        markers: [
            [61.18, -149.53],
            [21.18, -157.49],
            [40.66, -73.56],
            [41.52, -87.37],
            [35.22, -80.84],
            [31.52, -87.37]
        ],
        series: {
            markers: [{
                attribute: 'fill',
                scale: ['#C8EEFF', '#0071A4'],
                normalizeFunction: 'polynomial',
                values: [408, 512, 550, 781],
                legend: {
                    vertical: true
                }
            },{
                attribute: 'image',
                scale: {
                    bank: '../assets/vendors/jquery-jvectormap/img/icon-bank.png',
                    factory: '../assets/vendors/jquery-jvectormap/img/icon-factory.png'
                },
                values: {
                    '4': 'bank',
                    '5': 'factory'
                },
                legend: {
                    horizontal: true,
                    cssClass: 'jvectormap-legend-icons',
                    title: 'Business type'
                }
            }],
            regions: [{
                scale: {
                    red: '#ff0000',
                    green: '#00ff00'
                },
                attribute: 'fill',
                values: {
                    "US-KS": 'red',
                    "US-MO": 'red',
                    "US-IA": 'green',
                    "US-NE": 'green'
                },
                legend: {
                    horizontal: true,
                    title: 'Color'
                }
            },{
                scale: {
                    redGreen: '../assets/vendors/jquery-jvectormap/img/bg-red-green2.png',
                    yellowBlue: '../assets/vendors/jquery-jvectormap/img/bg-yellow-blue.png'
                },
                values: {
                    "US-TX": 'redGreen',
                    "US-CA": 'yellowBlue'
                },
                attribute: 'fill',
                legend: {
                    horizontal: true,
                    cssClass: 'jvectormap-legend-bg',
                    title: 'Pattern',
                    labelRender: function(v){
                        return {
                            redGreen: 'low',
                            yellowBlue: 'high'
                        }[v];
                    }
                }
            }]
        }
    };

    $scope.plants = [
        {name: 'VAK', coords: [50.0091294, 9.0371812], status: 'closed', offsets: [0, 2]},
        {name: 'MZFR', coords: [49.0543102, 8.4825862], status: 'closed', offsets: [0, 2]},
        {name: 'AVR', coords: [50.9030599, 6.4213693], status: 'closed'},
        {name: 'KKR', coords: [53.1472465, 12.9903674], status: 'closed'},
        {name: 'KRB', coords: [48.513264, 10.4020357], status: 'activeUntil2018'},
        {name: 'KWO', coords: [49.364503, 9.076252], status: 'closed'},
        {name: 'KGR', coords: [54.1417497, 13.6583877], status: 'closed'},
        {name: 'KWB', coords: [49.709331, 8.415865], status: 'closed'},
        {name: 'KWW', coords: [51.6396481, 9.3915617], status: 'closed'},
        {name: 'GKN', coords: [49.0401151, 9.1721088], status: 'activeUntil2022'},
        {name: 'KKB', coords: [53.8913533, 9.2005777], status: 'closed', offsets: [0, -5]},
        {name: 'KKI', coords: [48.5544748, 12.3472095], status: 'activeUntil2022', offsets: [0, 2]},
        {name: 'KKU', coords: [53.4293465, 8.4774649], status: 'closed'},
        {name: 'THTR', coords: [51.6786228, 7.9700232], status: 'closed'},
        {name: 'KKE', coords: [52.4216974, 7.3706389], status: 'activeUntil2022', offsets: [0, 2]}
    ];

    $scope.vectorMapOption4 = {
        map: 'de_merc_en',
        backgroundColor: 'transparent',
        markers:   $scope.plants.map(function(h){ return {name: h.name, latLng: h.coords} }),
        labels: {
            markers: {
                render: function(index){
                    return   $scope.plants[index].name;
                },
                offsets: function(index){
                    var offset =   $scope.plants[index]['offsets'] || [0, 0];

                    return [offset[0] - 7, offset[1] + 3];
                }
            }
        },
        series: {
            markers: [{
                attribute: 'image',
                scale: {
                    'closed': '../assets/vendors/jquery-jvectormap/img/icon-np-3.png',
                    'activeUntil2018': '../assets/vendors/jquery-jvectormap/img/icon-np-2.png',
                    'activeUntil2022': '../assets/vendors/jquery-jvectormap/img/icon-np-1.png'
                },
                values:   $scope.plants.reduce(function(p, c, i){ p[i] = c.status; return p }, {}),
                legend: {
                    horizontal: true,
                    title: 'Nuclear power station status',
                    labelRender: function(v){
                        return {
                            closed: 'Closed',
                            activeUntil2018: 'Scheduled for shut down<br> before 2018',
                            activeUntil2022: 'Scheduled for shut down<br> before 2022'
                        }[v];
                    }
                }
            }]
        }
    }


});