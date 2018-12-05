module.exports = function(){
  var defaultObj = require('../../config/defaultVariable');
  var route = require('express').Router();
  var conn = require('../../config/db')();

  route.get('', function(req, res) {
    var sql = 'SELECT explanation FROM Description WHERE route=?';

    // conn.query(sql, ['seoulAssembly'], (err, results) => {
    //   if(err){
    //     console.log(err);
    //     return res.redirect('/err');
    //   } else{
    //     var massage = {
    //       "message": {
    //         "text": results[0].explanation
    //       },
    //       "keyboard": {
    //         type: 'buttons',
    //         buttons: defaultObj.seoulAssemblyResult.bt
    //       }
    //     };
    //     res.json(massage);
    //   }
    // });
    
    if(!defaultObj.seoulAssemblyResult.check){
      massage = {
        "message": {
          "text": '오늘 집회정보가 없스뮤 ㅠㅠ',
        },
        "keyboard": {
          type: 'buttons',
          buttons: defaultObj.mainbutton
        }
      };

    }
    else{
      massage = {
        "message": {
          "text": defaultObj.seoulAssemblyResult.str,
          "photo": {
            "url": defaultObj.seoulAssemblyResult.img,
            "width": 640,
            "height": 480
          },
          "message_button": {
            "label" : '사진 크게 보기',
            "url" : defaultObj.seoulAssemblyResult.img
          }
        },
        "keyboard": {
          type: 'buttons',
          buttons: defaultObj.seoulAssemblyResult.bt
        }
      };
    }


    res.json(massage);
  });


  // route.get('/result', function(req, res) {
  //   massage = {
  //     "message": {
  //       "text": defaultObj.seoulAssemblyResult.str,
  //       "photo": {
  //         "url": defaultObj.seoulAssemblyResult.img,
  //         "width": 640,
  //         "height": 480
  //       },
  //       "message_button": {
  //         "label" : '사진 크게 보기',
  //         "url" : defaultObj.seoulAssemblyResult.img
  //       }
  //     },
  //     "keyboard": {
  //       type: 'buttons',
  //       buttons: defaultObj.seoulAssemblyResult.bt
  //     }
  //   };

  //   res.json(massage);
  // });

  return route;
}
