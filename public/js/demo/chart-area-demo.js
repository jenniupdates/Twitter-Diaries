
// Area Chart Example
var ctx = document.getElementById("myAreaChart");
var sentimentString = document.getElementById("myAreaChart").innerHTML;
var sentimentObj = JSON.parse(sentimentString);
var labelmonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
var datasentiment = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
for (month in sentimentObj) {
    var index = labelmonth.indexOf(month)
    datasentiment[index] = sentimentObj[month]
}


var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labelmonth,
        datasets: [{
            label: 'sentiment level per month',
            data: datasentiment,
            pointBorderWidth: 5,
            pointBorderColor: 'rgba(172, 172, 172,1)',
            backgroundColor: [
                'rgba(230, 187, 173, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1,
            pointHoverRadius: 7
        }]
    },
    options: {
        tooltips: {
            callbacks: {
              label: function(tooltipItem, data) {
                return data['labels'][tooltipItem['index']] + ': ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
              }
            }
          },

          title: {
            display: true,
            text: 'positive % = happy / negative % = sad '
        },

            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'sentiment level '
            },
            ticks: {
                beginAtZero: true,
                suggestedMin: -100,
                suggestedMax: 100,
                callback: function(value) {
                    return value + "%"
                }
            },
            scaleLabel: {
                display: true,
                labelString: "Percentage"
            }
                }]
            }
        }
    });