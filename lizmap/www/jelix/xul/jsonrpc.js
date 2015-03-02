/*
 @package     jelix
 @subpackage  xul
 @author   Laurent Jouanneau
 @contributor
 @copyright 2006-2008 Laurent Jouanneau
 @link     http://www.jelix.org
 @licence  GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
*/

/**
 * send jsonrpc request. Compatible only for mozilla.
 */
function JsonRpcException(msg){
   this.message=msg;
   this.error=true;
}

function JsonRpcRequester (){
   this.url='';
   this.response=null;
   this.id=1;
}

JsonRpcRequester.prototype = {
    request : function(methodname, parameters){
        var datas = { method: methodname, params:parameters, id:1 };
        if(this._sendRequest(datas)){
            return this.response.result;
        }else{
            return false;
        }

    },
    notify : function(methodname, parameters){
        var datas = { method: methodname, params:parameters, id:null };
        this._sendRequest(datas);
    },
    _sendRequest : function(datas){

      if(this.url == '') throw new JsonRpcException('url may not be empty');

      var strrequest = datas.toSource();
      strrequest = strrequest.substring(1, strrequest.length -1); // on enleve les () qui entourent

      var p = new XMLHttpRequest();
      p.onload = null;
      p.open("POST",this.url, false);
      p.setRequestHeader("Content-type","text/plain"); //"application/x-www-form-urlencoded");
      p.send(strrequest);

      if ( p.status != "200" ) {
         throw new JsonRpcException("Error during getting response (" + p.status+")");
      } else {
         if(datas.id != null){
             var responsestr = "this.response = "+ p.responseText;
             eval (responsestr);
             // {result:"" , error:"", id:""}
             return this.response.error == null;
         }
         else return true;
      }
   }
}

