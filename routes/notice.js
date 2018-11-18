module.exports = function(){
  var defaultObj = require('../config/defaultVariable');
  var app = require('../app.js');
  var route = require('express').Router();
  const fs = require('fs');
  var cNoticeContents = require('../crawling/crawling_Notice_Contents');
  var cNotice = require('../crawling/crawling_Notice');
  var deasync = require('deasync');

  route.get('', function(req, res) {
    var mode = req.query.mode;
    var content = req.query.content;
    var idx = req.query.idx;


    //공지사항 글 클릭시 상세 내용을 출력
    if (mode == defaultObj.NTCR) {
      return res.redirect("/notice/ntcr?idx=" + idx + "&mode=" + mode + "&content=" + getreplace(content));
    }
    //글 검색하기 버튼을 누른 경우
    else if (mode == defaultObj.NTCS) {
      return res.redirect("/notice/ntcs?idx=" + idx + "&mode=" + mode + "&content=" + getreplace(content));
    }
    // //옆으로 이동
    // else if ((app.user[idx].mode == NTCLR || app.user[idx].mode == NTCLS) && (content == '>' || content == '<')) {
    //   return res.redirect("/notice/ntcl?idx=" + idx + "&mode=" + mode + "&content=" + content);
    // }
    else if (mode == defaultObj.NTCLR || mode == defaultObj.NTCLS) { //NTCLR or NTCLS 모드
      return res.redirect("/notice/ntcl?idx=" + idx + "&mode=" + mode + "&content=" + getreplace(content));
    }

    var sql = 'SELECT explanation FROM Description WHERE route=?';

    conn.query(sql, ['notice'], (err, results) => {
      if(err){
        console.log(err);
        return res.redirect('/err');
      } else{
        var massage = {
          "message": {
            "text": results[0].explanation
          },
          "keyboard": {
            type: 'buttons',
            buttons: defaultObj.ntcbutton
          }
        };
        res.json(massage);
      }
    });
  });



  route.get('/ntcr', function(req, res) {
    var mode = req.query.mode;
    var content = req.query.content;
    var idx = req.query.idx;

    result = resultSetDetailNotice(content, app.user[idx].noticeObj);

    app.user[idx].mode = app.user[idx].noticeObj.mode;

    massage = {
      "message": {
        "text": result.str,
        "message_button": {
          "label" : 'PC 링크 바로가기',
          "url" : result.url
        }
      },
      "keyboard": {
        type: 'buttons',
        buttons: app.user[idx].noticeObj.bt
      }
    };

    res.json(massage);
  });


  route.get('/ntcs', function(req, res) {
    massage = {
      "message": {
        "text": "검색할 키워드를 입력해 주세요."
      }
    };

    res.json(massage);
  });



  route.get('/ntcl', function(req, res) {
    var mode = req.query.mode;
    var content = req.query.content;
    var idx = req.query.idx;

    if ((app.user[idx].mode == defaultObj.NTCLR || app.user[idx].mode == defaultObj.NTCLS) && (content == '>' || content == '<')) {
      if (content == '>')
        app.user[idx].noticeObj.page++;
      else if (content == '<')
        app.user[idx].noticeObj.page--;

      result = setNoticeResult(content, app.user[idx]);

      app.user[idx].noticeObj = result;

      massage = {
        "message": {
          "text": app.user[idx].noticeObj.explan
        },
        "keyboard": {
          type: 'buttons',
          buttons: app.user[idx].noticeObj.bt
        }
      };
    } else { //NTCLR or NTCLS 모드를 처음 들어올때
      app.user[idx].noticeObj.page = 1;

      app.user[idx].noticeObj.mode = app.user[idx].mode;
      app.user[idx].noticeObj.keyword = content;

      result = setNoticeResult(content, app.user[idx]);

      //글 검색하기에서 검색결과가 없을 경우
      if (result == '[등록된 게시물이 없습니다.]\n') {

        massage = {
          "message": {
            "text": result
          },
          "keyboard": {
            type: 'buttons',
            buttons: defaultObj.ntcbutton
          }
        };
      }
      //글 검색하기에서 검색결과가 있을 경우 혹은 최신글 보기를 누른 경우 글의 목록을 보여준다.
      else {
        app.user[idx].noticeObj = result;

        massage = {
          "message": {
            "text": app.user[idx].noticeObj.explan
          },
          "keyboard": {
            type: 'buttons',
            buttons: app.user[idx].noticeObj.bt
          }
        };
      }
    }

    res.json(massage);
  });



  function setNoticeResult(keyword, selectUser) {
    var resultList;

    mode = selectUser.mode;
    noticePage = selectUser.noticeObj.page;
    noticeMode = selectUser.noticeObj.mode;
    noticeKeyword = selectUser.noticeObj.keyword;

    cNotice.search(keyword, noticePage, noticeMode, noticeKeyword)
      .then(temp => {
        if (temp == '[등록된 게시물이 없습니다.]\n')
          resultList = temp;
        else
          resultList = resultSetNotice(keyword, temp, mode);
      });

    while (resultList == undefined)
      deasync.runLoopOnce();

    return resultList;
  }


  //공지사항의 글 목록을 리턴
  function resultSetNotice(keyword, noticeObj, mode) {
    if (mode == defaultObj.NTCLR) {
      noticeObj.explan = '최근 게시글 ' + noticeObj.page;
    } else {
      noticeObj.explan = noticeObj.keyword + '(으)로 검색한 게시글 ' + noticeObj.page;
    }

    noticeObj.explan += '페이지입니다.\n버튼을 눌러 상세 내용을 확인하세요.\n뒤로가기를 누르면 뒤로 돌아갑니다.';
    noticeObj.bt.unshift('뒤로가기');

    return noticeObj;
  }

  //공지사항 글 클릭시 상세 내용을 출력해주기 위해 세부 내용 리턴
  function resultSetDetailNotice(keyword, noticeobj) {
    notice_idx = noticeobj.contents.map(x => x.title).indexOf(keyword)

    var content = '';
    var url = noticeobj.contents[notice_idx].pc;
    var result = new Object();

    cNoticeContents.search(url)
      .then(temp => {
        content = temp
      });

    while (content == '') {
      deasync.runLoopOnce();
    }

    result.str = '[제목]\n'+noticeobj.contents[notice_idx].title+'\n\n';
    result.str += '[본문]\n'+ content;
    result.url = noticeobj.contents[notice_idx].pc

    return result;
  }


  function getreplace(inum) {
      inum = inum.replace(/&/g,"%26");
      inum = inum.replace(/\+/g,"%2B");
      return inum;
  }

  return route;
}
