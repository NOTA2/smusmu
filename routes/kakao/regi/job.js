const conn = require('../../../config/db');
const router = require('express').Router();
const defaultObj = require('../../../config/defaultVariable');

router.post('', (req, res) => {
  var kakaoId = req.body.userRequest.user.id;
  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '스뮤스뮤 등록이 안돼있어요!'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.homeQuickReplies.slice(1, 1))
    }
  };

  let sql = `SELECT kakaoId, name, major, homepage, token, schoolId
            FROM users, major 
            where kakaoId=? AND majorId=major.id`

  conn.query(sql, [kakaoId], (err, rows) => {
    if (err) {
      throw err;
    }

    let user = rows[0];

    sql = `SELECT * FROM job ORDER BY jobOrder`

    conn.query(sql, (err, rows) => {
      if (err || rows.length == 0) {
        console.log(err);
        return res.json(message)
      }

      message.template.quickReplies = defaultObj.Qu.concat({
        "label": "제휴정보 🤝",
        "action": "block",
        "messageText": "제휴정보",
        "blockId": "5c2f021d5f38dd44d86a2321"
      })
      message.template.outputs[0] = {
        "carousel": {
          "type": "basicCard",
          "items": []
        }
      }
      rows.forEach((el, idx) => {

        let params = JSON.parse(el.params);

        let middleurl

        if (params.length > 0) {
          middleurl = `http://${defaultObj.ipadd}/kakao/job?`
          params.forEach((el, idx) => {
            if (el.value)
              middleurl += `${el.name}=${el.value}`
            else {
              if (el.name.indexOf('ID') != -1)
                middleurl += `${el.name}=${user.schoolId}`
              else if (el.name.indexOf('Name') != -1)
                middleurl += `${el.name}=${user.name}`
            }
            
            middleurl += `&`
          })
          middleurl+=`url=${el.url}`
        } else {
          middleurl = encodeURI(el.url)
        }

        message.template.outputs[0].carousel.items.push({
          "title": el.title,
          "description": el.description,
          "thumbnail": {
            "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/job/${el.thumbnail}`)
          },
          "buttons": [{
            "label": "서비스 바로가기 🌐",
            "action": "webLink",
            "webLinkUrl": middleurl
          }]
        });
      })
      return res.json(message)
    });
  })
})

router.get('', (req, res) => {
  let params;

  params =  Object.keys(req.query).map(x=>{
    return {
      name : x,
      value : req.query[x]
    }
  });

  console.log(params);
  let url = params.pop();
  let submit = `$("#frm").submit()`
  
  // return res.send('hello')

  if(Object.keys(req.query).indexOf("UserName_client") != -1)
    submit = "eduwillSubmit()"

  res.send(`      
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script>
      eduwillSubmit = function(){
        fncEnCode(document.getElementById("UserName_client").value);
          
          /** 모바일 기기에 대해서 전송 변경 처리 시작 **/
          if(navigator.userAgent.match(/Android|Mobile|iP(hone|od|ad)|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/)){
            document.getElementById("frm").action ="https://smu.eduwill.net/m/member/loginSSOCheck.will";
          }
          /** 모바일 기기에 대해서 전송 변경 처리 끝 **/
          document.getElementById("frm").submit();
        
      }
      
      fncEnCode = function(param) {
          var encode = '';
          for(i=0; i<param.length; i++){
            var len  = ''+param.charCodeAt(i);
            var token = '' + len.length;
            encode  += token + param.charCodeAt(i);
          }
          document.getElementById("UserName").value = encode;
        }

        $(document).ready(function(){
          ${submit};
        });
    </script>
    <div style="display:none">
      <form id="frm" action="${url.value}" method="post">
        ${params.map((el, i) => `
          <input id="${el.name}" name="${el.name}" value="${el.value}" />
        `).join('')}
      </form>
    </div>
    `)
})


module.exports = router;