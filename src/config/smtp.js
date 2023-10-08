
let recuperacao = (nome, password) => {
  return `
  <table bgcolor="#e6e6e6" width="100%" align="center"  mc:repeatable="castellab" mc:variant="Header" cellspacing="0" cellpadding="0" border="0">
    <tr>
       <td>
          <table class="table1 editable-bg-color bg_color_303f9f" bgcolor="#2563EB" width="600" align="center" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
             <tr>
                <td height="25"></td>
             </tr>
             <tr>
                <td>
                   <table class="table1" width="520" align="center" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                         <td>
                            <table width="50%" align="left" border="0" cellspacing="0" cellpadding="0">
                               <tr>
                                  <td align="left">
                                     <a href="https://www.softinsa.pt/pt/" class="editable-img">
                                     <img editable="true" mc:edit="image001" src="https://i.postimg.cc/tCVf14Lf/logo-branco.png" width="68" style="display:block; line-height:0; font-size:0; border:0;" border="0" alt="logo" />
                                     </a>
                                  </td>
                               </tr>
                               <tr>
                                  <td height="22"></td>
                               </tr>
                            </table>
                         </td>
                      </tr>
                      <tr>
                         <td height="60"></td>
                      </tr>
                      <tr>
                         <td align="center">
                            <div class="editable-img">
                               <img editable="true" mc:edit="image003" src="https://i.postimg.cc/ZKBkrcyw/rounded-white.png"  style="display:block; line-height:0; font-size:0; border:0;" border="0" alt="" />
                            </div>
                         </td>
                      </tr>
                      <tr>
                         <td height="40"></td>
                      </tr>
                      <tr>
                         <td mc:edit="text001" align="center" class="text_color_ffffff" style="color: #ffffff; font-size: 30px; font-weight: 700; font-family: lato, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                            <div class="editable-text">
                               <span class="text_container">
                                  <multiline>
                                     Olá, ` + nome + `
                                  </multiline>
                               </span>
                            </div>
                         </td>
                      </tr>
                      <tr>
                         <td height="10"></td>
                      </tr>
                      <tr>
                         <td mc:edit="text002" align="center" class="text_color_ffffff" style="color: #ffffff; font-size: 12px; font-weight: 300; font-family: lato, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                            <div class="editable-text">
                               <span class="text_container">
                                  <multiline>
                                    Recebemos o seu pedido de recuperação de conta!
                                  </multiline>
                               </span>
                            </div>
                         </td>
                      </tr>
                   </table>
                </td>
             </tr>
             <tr>
                <td height="50"></td>
             </tr>
          </table>
       </td>
    </tr>
    <tr>
       <td>
          <table class="table1 editable-bg-color bg_color_ffffff" bgcolor="#ffffff" width="600" align="center" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
             <tr>
                <td height="60"></td>
             </tr>
             <tr>
                <td>
                   <table class="container_400" align="center" width="400" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                         <td mc:edit="text003" align="center" class="text_color_282828" style="color: #282828; font-size: 15px; line-height: 2; font-weight: 500; font-family: lato, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                            <div class="editable-text" style="line-height: 2;">
                               <span class="text_container">
                                  <multiline>
									                  Porfavor, utilize a seguinte palavra-passe tempóraria para aceder a sua conta.
                                  </multiline>
                               </span>
                            </div>
                         </td>
                      </tr>
                      <tr>
                         <td height="25"></td>
                      </tr>
                      <tr>
                         <td align="center">
                            <table bgcolor="#2563EB" width="225" height="50" align="center" border="0" cellpadding="0" cellspacing="0" style="background-color:#2563EB; border-radius:3px;">
                               <tr>
                                  <td mc:edit="text004" align="center" valign="middle" style="color: #ffffff; font-size: 16px; font-weight: 600; font-family: lato, Helvetica, sans-serif; mso-line-height-rule: exactly;" class="text_color_ffffff">
                                     <div class="editable-text">
                                        <span class="text_container">
                                           <multiline>
                                              <span style="user-select:none">Senha: </span>` + password + `
                                           </multiline>
                                        </span>
                                     </div>
                                  </td>
                               </tr>
                            </table>
                         </td>
                      </tr>
                      <tr>
                         <td height="25"></td>
                      </tr>
                   </table>
                </td>
             </tr>
             <tr>
                <td height="60"></td>
             </tr>
          </table>
       </td>
    </tr>
    <tr>
       <td>
          <table class="table1" width="600" align="center" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
             <tr>
                <td height="40"></td>
             </tr>
             <tr>
                <td>
                   <table class="tablet_hide" width="130" align="left" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                         <td height="1"></td>
                      </tr>
                   </table>
                </td>
             </tr>
             <tr>
                <td height="70"></td>
             </tr>
          </table>
       </td>
    </tr>
  </table>
  `
}


let ativacao = (nome, password) => {
  return `
  <table bgcolor="#e6e6e6" width="100%" align="center"  mc:repeatable="castellab" mc:variant="Header" cellspacing="0" cellpadding="0" border="0">
    <tr>
       <td>
          <table class="table1 editable-bg-color bg_color_303f9f" bgcolor="#2563EB" width="600" align="center" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
             <tr>
                <td height="25"></td>
             </tr>
             <tr>
                <td>
                   <table class="table1" width="520" align="center" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                         <td>
                            <table width="50%" align="left" border="0" cellspacing="0" cellpadding="0">
                               <tr>
                                  <td align="left">
                                     <a href="https://www.softinsa.pt/pt/" class="editable-img">
                                     <img editable="true" mc:edit="image001" src="https://i.postimg.cc/tCVf14Lf/logo-branco.png" width="68" style="display:block; line-height:0; font-size:0; border:0;" border="0" alt="logo" />
                                     </a>
                                  </td>
                               </tr>
                               <tr>
                                  <td height="22"></td>
                               </tr>
                            </table>
                         </td>
                      </tr>
                      <tr>
                         <td height="60"></td>
                      </tr>
                      <tr>
                         <td align="center">
                            <div class="editable-img">
                               <img editable="true" mc:edit="image003" src="https://i.postimg.cc/ZKBkrcyw/rounded-white.png"  style="display:block; line-height:0; font-size:0; border:0;" border="0" alt="" />
                            </div>
                         </td>
                      </tr>
                      <tr>
                         <td height="40"></td>
                      </tr>
                      <tr>
                         <td mc:edit="text001" align="center" class="text_color_ffffff" style="color: #ffffff; font-size: 30px; font-weight: 700; font-family: lato, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                            <div class="editable-text">
                               <span class="text_container">
                                  <multiline>
                                     Bem-vindo/a, ` + nome + `
                                  </multiline>
                               </span>
                            </div>
                         </td>
                      </tr>
                      <tr>
                         <td height="10"></td>
                      </tr>
                      <tr>
                         <td mc:edit="text002" align="center" class="text_color_ffffff" style="color: #ffffff; font-size: 12px; font-weight: 300; font-family: lato, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                            <div class="editable-text">
                               <span class="text_container">
                                  <multiline>
                                    A sua conta foi registada com sucesso!
                                  </multiline>
                               </span>
                            </div>
                         </td>
                      </tr>
                   </table>
                </td>
             </tr>
             <tr>
                <td height="50"></td>
             </tr>
          </table>
       </td>
    </tr>
    <tr>
       <td>
          <table class="table1 editable-bg-color bg_color_ffffff" bgcolor="#ffffff" width="600" align="center" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
             <tr>
                <td height="60"></td>
             </tr>
             <tr>
                <td>
                   <table class="container_400" align="center" width="400" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                         <td mc:edit="text003" align="center" class="text_color_282828" style="color: #282828; font-size: 15px; line-height: 2; font-weight: 500; font-family: lato, Helvetica, sans-serif; mso-line-height-rule: exactly;">
                            <div class="editable-text" style="line-height: 2;">
                               <span class="text_container">
                                  <multiline>
									                  Porfavor, utilize a seguinte palavra-passe tempóraria para aceder a sua conta.
                                  </multiline>
                               </span>
                            </div>
                         </td>
                      </tr>
                      <tr>
                         <td height="25"></td>
                      </tr>
                      <tr>
                         <td align="center">
                            <table bgcolor="#2563EB" width="225" height="50" align="center" border="0" cellpadding="0" cellspacing="0" style="background-color:#2563EB; border-radius:3px;">
                               <tr>
                                  <td mc:edit="text004" align="center" valign="middle" style="color: #ffffff; font-size: 16px; font-weight: 600; font-family: lato, Helvetica, sans-serif; mso-line-height-rule: exactly;" class="text_color_ffffff">
                                     <div class="editable-text">
                                        <span class="text_container">
                                           <multiline>
                                              <span style="user-select:none">Senha: </span>` + password + `
                                           </multiline>
                                        </span>
                                     </div>
                                  </td>
                               </tr>
                            </table>
                         </td>
                      </tr>
                      <tr>
                         <td height="25"></td>
                      </tr>
                   </table>
                </td>
             </tr>
             <tr>
                <td height="60"></td>
             </tr>
          </table>
       </td>
    </tr>
    <tr>
       <td>
          <table class="table1" width="600" align="center" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
             <tr>
                <td height="40"></td>
             </tr>
             <tr>
                <td>
                   <table class="tablet_hide" width="130" align="left" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                         <td height="1"></td>
                      </tr>
                   </table>
                </td>
             </tr>
             <tr>
                <td height="70"></td>
             </tr>
          </table>
       </td>
    </tr>
  </table>
  `
}

module.exports = {
  ativacao,
  recuperacao
};