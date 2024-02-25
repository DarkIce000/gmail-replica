document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));

  document.querySelector('#sent').addEventListener('click', () => {
    load_mailbox('sent');
    document.querySelector('#reply-btn').style.display = 'none'
    document.querySelector('#archive-btn').style.display = 'none'
  });

  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  document.querySelector('#compose-form').onsubmit = send_mail;
  load_mailbox('inbox');

});



// compose mail
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



// loading maibox 
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';

  // body div 
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  //fetching the email of the respective mailbox 
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(result => {
      
      const boxDiv = document.querySelector('#emails-view');
      for (let i of result){
        boxDiv.innerHTML += `<div class="border rounded m-1" onclick="email_view(${i.id})">
        ${ i.sender}: ${ i.subject } <span class="text-align-end"> ${ i.timestamp} </span>
        </div>`
      }
    })
  .catch(error => {
      console.log(`something happen at server side ${error}`)
    })

  return false;

}



// sending mail to the server 
function send_mail(event){

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  //send the email as post to the server 
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      console.log(result);
      //loading the sent box after sending the email
      load_mailbox('sent');
    })

  return false;
}



// email view home page function 
function email_view(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(result => {
      console.log(result);

      // hiding other divs from other inboxes 
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none'

      // showing div from 
      document.querySelector('#email').innerHTML= `
        <div id="sender" class="border rounded m-3">Sender: ${ result.sender }</div>
        <div id="subject" class="border rounded m-3">Subject: ${ result.subject }</div>
        <div id="body" class="border rounded m-3"style="height:400px">Body: ${ result.body }</div>
        `;

      const archiveDiv = document.createElement('div');
      const replyDiv = document.createElement('div');

      archiveDiv.className = 'btn btn-primary mx-2';
      replyDiv.className = 'btn btn-primary mx-2';

      archiveDiv.setAttribute('id', 'archive-btn');
      replyDiv.setAttribute('id', 'reply-btn');

      replyDiv.innerHTML = 'Reply';

      if (result.archived){
        archiveDiv.innerHTML = 'Unarchive';
      }
      else if(!result.archived){
        archiveDiv.innerHTML = 'Archive';
      }

      replyDiv.addEventListener('click', () => reply(result.sender, result.subject, result.body , result.timestamp));
      archiveDiv.addEventListener('click', () => archive(result.id, result.archived));
     
      // getting the sender and reciepient for checking sent box 

      document.querySelector('#email').append(archiveDiv);
      document.querySelector('#email').append(replyDiv);


    })

  return false;
}

function reply(sender, subject, body, timestamp){
    // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#emails-view').innerHTML = `<h3>Reply</h3>`;
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = sender;
  document.querySelector('#compose-subject').value = 'Re: ' + subject;
  document.querySelector('#compose-body').value = `${ timestamp } ${ sender } wrote: 
------------------------------------------------------
${body} `;

  return false;
}


function archive(id, archive_status ){

  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  if (archive_status){

    fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
      })
    })

    load_mailbox('inbox');

    return false 

  }

  fetch(`/emails/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: true
    })
  })

  load_mailbox('inbox')
  return false;
}
