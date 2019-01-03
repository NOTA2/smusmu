require('date-utils');
const fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
//😂😁☺😉🤪😣😔😫😩😥😵☀🌦💧❄🌤🌧☃💦☔⛄⛈⛅🌥🌩🌬☂🌊💨🌨☁🌫
var sky = ['', '맑고☀,\n', '구름이 조금있고,\n', '구름이 많으며☁,\n', '흐리며☁,\n'];
var skybefore = ['', '맑다가☀', '구름이 조금있다가', '구름이 많았다가☁', '흐렸다가☁🌫'];
var skyafter = ['', '맑아☀질 것', '구름이 조금 생길 것', '구름이 많아☁질 것', '흐려질☁🌫 것'];
var ptybefore = ['없다가☺', '비☔가 오다가 ', '진눈깨비☔❄가 오다가', '진눈깨비🌨가 오다가', '눈⛄이 오다가'];
var ptyafter = ['그칠 것😁', '비☔가 올 것', '진눈깨비☔❄가 올 것', '진눈깨비🌨가 올 것', '눈⛄이 올 것'];
var grade = ['', '좋음', '보통', '나쁨', '매우나쁨'];
var grade2 = ['', '😁', '😔', '😣', '😵'];
var weather = {
  t1h: 0, //현재온도
  npyt: 0, //현재강수
  nwsd: 0, //현재풍속
  tmn: -999, //최저기온
  tmx: -999, //최고기온
  sky: [0, 0], //구름상태
  pty: [0, 0, 0, 0], //강수상태  마지막에는 시간 기록
  pop: [0, 0, 0, 0], //강수확률  마지막에는 시간 기록
  r06: 0.0, //12시간 예상 강수량
  s06: 0.0, //12시간 예상 적렬량
  pm1024: 0,
  pm2524: 0,
  khai: 0
};
var changepop, changepty, changesky, on;

//최저, 최고, 현재 기온
//습도, 강수 확률
//구름/강수 상태
//강수량

// 현재 : 기온(T1H), 구름(SKY), 강수(PTY)
// 예보 : 최저(TMN), 최고(TMX), 구름(SKY), 강수(PTY), 강수확률(POP), 12시간 예상 강수(적설)량(r06, s06)

// 하늘상태(SKY) 코드 : 맑음(1), 구름조금(2), 구름많음(3), 흐림(4)
// 강수형태(PTY) 코드 : 없음(0), 비(1), 비/눈(2), 눈(3)
// 여기서 비/눈은 비와 눈이 섞여 오는 것을 의미 (진눈개비)

var nx = 60;
var ny = 127;
const weather_apikey = fs.readFileSync('key/weather_apikey', 'utf-8');
const dust_apikey = fs.readFileSync('key/dust_apikey', 'utf-8');



//기상 예보 정보를 가져오는 API
var urlForecast = 'http://www.kma.go.kr/wid/queryDFS.jsp?gridx=60&gridy=127'

//미세먼지 정보를 가져오는 API
var urlDust = "http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?stationName=%EC%A2%85%EB%A1%9C%EA%B5%AC&dataTerm=daily&pageNo=1&numOfRows=23&ServiceKey=" + dust_apikey.trim() + "&ver=1.3"

exports.search = function(keyword) {
  //현재 시간을 구한다.
  var dt = new Date();
  var ymd = dt.toFormat("YYYYMMDD");
  var time = dt.toFormat("HH24MI");

  //20분까지는 예보정보가 안나오는 경우가있어서 시간을 25분 뒤로 돌려서 정보를 받는다.
  if(time[2] == '0' || time[2] == '1'){
      temp = dt.getTime() - (25*60*1000);
      dt.setTime(temp);
      ymd = dt.toFormat("YYYYMMDD");
      time = dt.toFormat("HH24MI");
  }

  //현재 기상정보를 가져오는 API
  var urlNow = "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastGrib?ServiceKey=" + weather_apikey.trim() + "&nx=" + nx + "&ny=" + ny;

  changepop = 0;
  changepty = 0;
  changesky = 0;
  on =0;
  urlNow = urlNow + "&base_date=" + ymd + "&base_time=" + time + "&numOfRows=20";

  weather.r06 = 0.0;
  weather.s06 = 0.0;

  return new Promise(function(resolve, reject) {
    var weatherResult = '';
    var nowData;
    var forecastData;
    var dustData;


    request(urlNow, function(error1, response1, htmlNow) {
      if (!error1 && response1.statusCode == 200) {

        //현재 날씨 데이터 받아오기
        try{
          parser.parseString(htmlNow, function(err, result) {
            end = result.response.body[0].items[0].item.length;
            nowData = result.response.body[0].items[0];
            for (i = 0; i < end; i++) {
              if (nowData.item[i].category[0] == 'T1H')
                weather.t1h = nowData.item[i].obsrValue[0];

              // else if (nowData.item[i].category[0] == 'SKY')
              //   weather.nsky = nowData.item[i].obsrValue[0];

              else if (nowData.item[i].category[0] == 'PTY')
                weather.npyt = nowData.item[i].obsrValue[0] >> 0;

              else if (nowData.item[i].category[0] == 'WSD')
                weather.nwsd = parseFloat(nowData.item[i].obsrValue[0]);
            }
          });
        } catch(e){
          console.log(e);
          console.log('현재 날씨 데이터 받아오기 실패');
        }

        //예보 날씨 데이터 받아오기
        request(urlForecast, function(error2, response2, htmlForecast) {
          if (!error2 && response2.statusCode == 200) {

            try{
              parser.parseString(htmlForecast, function(err, result) {
                forecastData = result.wid.body[0].data;

                for (i = 0; i < forecastData.length; i++) {
                  //20시 이후에는 내일 날씨를 알려준다.
                  if ((parseInt(time) > 2000) || (parseInt(time) < 241)) {
                    getForecastData(forecastData, i, '1');
                  } else {
                    getForecastData(forecastData, i, '0');
                  }
                }
              });
            }catch(e){
              console.log(e);
              console.log('예보 날씨 데이터 받아오기 실패');
            }


            //미세먼지 정보 가져오기
            request(urlDust, function(error3, response3, htmlDust) {
              if (!error3 && response3.statusCode == 200) {
                try{
                  parser.parseString(htmlDust, function(err, result) {

                    dustData = result.response.body[0].items[0].item;

                    for(i in dustData){
                      if((dustData[i].pm10Grade[0] >> 0) >=1 && weather.pm1024 == 0){
                        weather.pm1024 = (dustData[i].pm10Grade[0] >> 0);
                        console.log('pm10grade 추가');
                      }

                      if((dustData[i].pm25Grade[0] >> 0) >=1 && weather.pm2524 == 0){
                        weather.pm2524 = (dustData[i].pm25Grade[0] >> 0)
                        console.log('pm25Grade 추가');
                      }

                      if((dustData[i].khaiGrade[0] >> 0) >=1 && weather.khai == 0){
                        weather.khai = (dustData[i].khaiGrade[0] >> 0)
                        console.log('khaiGrade 추가');
                      }
                    }

                  });
                } catch(e){
                  console.log(e);
                  console.log('미세먼지 데이터 받기 실패');
                }
                weatherResult = setWeatherResult(time);
                resolve(weatherResult);
              }
            });
          }
        });
      }
    });
  });
}

//예보정보를 다듬어서 반환한다.
function getForecastData(forecastData, i, day) {
  if (forecastData[i].day[0] == day) {
    //최고온도 갱신
    if ((forecastData[i].tmn[0] >> 0) != -999)
      weather.tmn = forecastData[i].tmn[0] >> 0;
    //최저온도 갱신
    if ((forecastData[i].tmx[0] >> 0) != -999)
      weather.tmx = forecastData[i].tmx[0] >> 0;

    //하늘 상태 갱신
    if (on == 1 && i != 0 && changesky == 0) { //두번재 부터는 앞의 값과 다를 경우 값을 추가
      weather.sky[1] = forecastData[i].sky[0] >> 0;
      if ((forecastData[i].sky[0] >> 0) != weather.sky[0])
        changesky = 1;
    } else if (on == 0)
      weather.sky[0] = forecastData[i].sky[0] >> 0;


    //강수확률 갱신
    if (on == 1 && i != 0 && changepop == 0) { //두번재 부터는 앞의 값과 다를 경우 값을 추가
      weather.pop[2] = forecastData[i].pop[0] >> 0;
      weather.pop[3] = forecastData[i].hour[0];
      if ((forecastData[i].pop[0] >> 0) != weather.pop[0])
        changepop = 1;
    } else if (on == 0){
      weather.pop[0] = forecastData[i].pop[0] >> 0;
      weather.pop[1] = forecastData[i].hour[0];
    }
    //강수 상태 갱신
    if (on == 1 && i != 0 && changepty == 0) { //두번재 부터는 앞의 값과 다를 경우 값을 추가
      weather.pty[2] = forecastData[i].pty[0] >> 0;
      weather.pty[3] = forecastData[i].hour[0];
      if ((forecastData[i].pty[0] >> 0) != weather.pty[0])
        changepty = 1;
    } else if (on == 0){
      weather.pty[0] = forecastData[i].pty[0] >> 0;
      weather.pty[1] = forecastData[i].hour[0];
    }

    if ((forecastData[i].pty[0] >> 0) != 0) {
      weather.r06 = parseFloat(forecastData[i].r06[0]);
      weather.s06 = parseFloat(forecastData[i].s06[0]);
    }

    on=1;
  }
}




//문장을 완성하는 함수
function setWeatherResult(time) {
  result = new Array();
  result[0] = ''
  result[0] += '현재 기온은 ' + weather.t1h + '℃ 입니다.\n그리고';
  // result += "하늘은 " + sky[weather.nsky];
  switch (weather.npyt) {
    case 0:
      result[0] += '비는 오지 않습니다.☀🙌\n';
      break;
    case 1:
      result[0] += '비🌧가 내립니다.\n';
      break;
    case 2:
      result[0] += '진눈개비🌧❄가 내립니다.\n';
      break;
    case 3:
      result[0] += '눈❄이 내립니다.\n';
  }

  if (weather.nwsd < 4)
    result[0] += '바람은 약하게 불고 있습니다.☺';
  else if (weather.nwsd >= 4 && weather.nwsd < 9)
    result[0] += '바람은 약간 강하게 불고 있습니다.😔';
  else if (weather.nwsd >= 9 && weather.nwsd < 14)
    result[0] += '바람은 강하게 불고 있습니다.😣';
  else if (weather.nwsd >= 14)
    result[0] += '바람은 매우 강하게 불고 있습니다.😣';

  result[1] = ''


  try{
    result[1] += '오늘 하루동안 '
    result[1] += '미세먼지는 [' + grade[weather.pm1024] + ']단계'+grade2[weather.pm1024]+'이고,\n'
    result[1] += '초 미세먼지는 [' + grade[weather.pm2524] + ']단계'+ grade2[weather.pm2524]+'입니다.\n'
    result[1] += '통합대기환경지수(CAI)는 ['+grade[weather.khai] + ']단계'+ grade2[weather.khai]+'입니다.\n';
  }  catch(e){
    result[1] += '미세먼지 데이터를 받아오지 못했어요 😥\n'
  }

  result[2] = '';

  //여기서 부터는 예보
  if (parseInt(time) > 2000)
    result[2] += '내일 날씨 예보입니다.\n';
  else
    result[2] += '현재시간 이후, 오늘 날씨 예보입니다.\n오늘 ';


  if (weather.tmn == -999 && weather.tmx == -999)
    result[2] += '최저/최고기온 정보가 없습니다.😥\n';
  else{
    if (weather.tmn == -999)
      result[2] += '최고기온은 ' + weather.tmx + '℃ 이고,\n최저기온 정보는 없습니다.😥\n';

    else if (weather.tmx == -999)
      result[2] += '최저기온은 ' + weather.tmn + '℃ 이고,\n최고기온 정보는 없습니다.😥\n';

    else
      result[2] += '최저기온은 ' + weather.tmn + '℃ 이고,\n최고기온은 ' + weather.tmx + '℃ 입니다.\n';
  }

  if (weather.sky[0] == weather.sky[1])
    result[2] += '하늘은 대체로 ' + sky[weather.sky[0]];
  else
    result[2] += '하늘은 ' + skybefore[weather.sky[0]] + ' ' + skyafter[weather.sky[1]] + "으로 예상됩니다.\n";


  if (weather.pty[0] == weather.pty[2]) {
    switch (weather.pty[0]) {
      case 0:
        result[2] += '비는 오지 않을 것으로 예상됩니다.😉\n';
        break;
      case 1:
        result[2] += '비☔가 올 것으로 예상됩니다.\n';
        break;
      case 2:
      case 3:
        result[2] += '진눈개비☔❄가 섞여 내릴 것으로 예상됩니다.\n';
        break;
      case 4:
        result[2] += '눈❄이 올 것으로 예상됩니다.\n';
    }
  } else {
    result[2] += '비 예보는 '+weather.pty[1]+ '시에는 ' + ptybefore[weather.pty[0]] + ' ' + weather.pty[3] + '시에는 ' + ptyafter[weather.pty[2]] + '으로 예상됩니다.\n'
  }

  if (weather.pop[0] == weather.pop[2])
    result[2] += '강수 확률은 ' + weather.pop[0] + '% 입니다.\n'
  else
    result[2] += '강수 확률은 '+ weather.pop[1] +'시에는 ' + weather.pop[0] + '%에서 ' + weather.pop[3] + '시에는 ' + weather.pop[2] + '%로 바뀔 것으로 보입니다.\n'


  if ((weather.r06 >= 0.1 && weather.r06 < 1) || (weather.s06 >= 0.1 && weather.s06 < 1))
    result[2] += '예상 강수(적설)량은 0.1 ~ 1mm 입니다.\n';
  else if ((weather.r06 >= 1 && weather.r06 < 5) || (weather.s06 >= 1 && weather.s06 < 5))
    result[2] += '예상 강수(적설)량은 1 ~ 5mm 입니다.\n';
  else if ((weather.r06 >= 5 && weather.r06 < 10) || (weather.s06 >= 5 && weather.s06 < 10))
    result[2] += '예상 강수(적설)량은 5 ~ 10mm 입니다.\n';
  else if ((weather.r06 >= 10 && weather.r06 < 25) || (weather.s06 >= 10 && weather.s06 < 25))
    result[2] += '예상 강수(적설)량은 10 ~ 25mm 입니다.\n';
  else if ((weather.r06 >= 25 && weather.r06 < 50) || (weather.s06 >= 25 && weather.s06 < 50))
    result[2] += '예상 강수(적설)량은 25 ~ 50mm 입니다.\n';
  else if ((weather.r06 >= 50) || (weather.s06 >= 50))
    result[2] += '예상 강수(적설)량은 50mm 이상입니다.\n';

  return result;
}
