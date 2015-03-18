::::: 서버를 시작하기 위한 안내서 :::::
[ 서버 시작하기 ]
* 설명 : forever를 사용하여 서버가 다운되었을때 재시작해준다. nodemon을 함께 동작시켜 파일이 갱신되었을경우 서버를 재시작하도록 한다.
* 명령어
forever start -c nodemon app.js

* 중지
forever stop /home/jahwal/node_root/jahwal-aerp/app.js

* 시작. 서버로그를 남긴다.
forever start -a -l ~/node_root/logs/jahwal/forever.log -o ~/node_root/logs/jahwal/out.log -e ~/node_root/logs/jahwal/err.log /home/jahwal/node_root/jahwal-aerp/app.js

* 서버에 restart스트립트를 남긴다. 업로드 이후 재시작해야 서버에 수정사항이 반영된다. 꼭 재시작할것.
jwrestart.sh

* DB서버 주소 : mongodb://172.27.164.77/jahwal