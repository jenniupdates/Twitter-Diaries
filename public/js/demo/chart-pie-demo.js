// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Pie Chart Example
var ctx = document.getElementById("tweetsPieChart");
var emotionObjStr = document.getElementById("tweetsPieChart").innerHTML;
var emotionObj = JSON.parse(emotionObjStr);
emotionList = ["Positive", "Neutral", "Negative"];
emotionListCount = [];

for($i=0; $i<emotionList.length; $i++){
  if (!(emotionList[$i] in emotionObj)){
    emotionList.pop($i);
  }
}

for(emotion of emotionList){
  emotionListCount.push(emotionObj[emotion]);
}

var myPieChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: emotionList,
    datasets: [{
      data: emotionListCount,
      backgroundColor: ['#1cc88a', '#858796', '#e74a3b'], 
      hoverBackgroundColor: ['#18ad78', '#5e5f69', '#b5392d'],
      hoverBorderColor: "rgba(234, 236, 244, 1)",
    }],
  },
  options: {
    maintainAspectRatio: false,
    tooltips: {
      backgroundColor: "rgb(255,255,255)",
      bodyFontColor: "#858796",
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      caretPadding: 10,
    },
    legend: {
      display: false
    },
    cutoutPercentage: 80,
  },
});
