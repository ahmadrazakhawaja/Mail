document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
   document.querySelector('#email-information').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').onsubmit = function() {
    var lol = 0;
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => {
      if(response.status===201){
         lol = 1;
         return response.json();
      }
      else{
        lol = 2;
        return response.json();
      }
    })
    .then(result => {
      
        if (lol===2){
          alert(result.error);
        }
        else{
          alert(result.message);
          load_mailbox('sent');
        }
        console.log(result);
    });
    return false;
  }

  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-information').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
.then(response => response.json())
.then(emails => {
    // Print emails
    
    emails.forEach(elementx => {
      const element = document.createElement('div');
    element.className="emails";
element.innerHTML = ` Sender: ${elementx.sender} <br> Subject: ${elementx.subject} <br> Timestamp: ${elementx.timestamp}`;
if (elementx.read===true){
  element.style.backgroundColor="gray";
}
else{
  element.style.backgroundColor="white";
}
element.addEventListener('click', function() {
  fetch(`/emails/${elementx.id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      document.querySelector('#emails-view').style.display = 'none';

      document.querySelector('#email-information').style.display = 'block';

      if (document.querySelector('#reply')===null){
        const elementr = document.createElement('button');
      document.querySelector('#button1').append(elementr);
      elementr.id ="reply";
      elementr.innerHTML="Reply";
      elementr.className="btn btn-primary";
      }
      document.querySelector('#reply').onclick = function(){
        reply(email,mailbox);
      }

      if (document.querySelector('#archive')===null){
        const elementb = document.createElement('button');
      document.querySelector('#button2').append(elementb);
      elementb.id ="archive";
      elementb.className="btn btn-primary";
      }
      document.querySelector('#archive').style.display = 'initial';
      if (mailbox==='inbox'){
        document.querySelector('#archive').innerHTML="archive";
        document.querySelector('#archive').onclick = function(){
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
          })
          alert("email has been archived.");
          load_mailbox('inbox');
        } 
      }
      if (mailbox==='archive'){
        document.querySelector('#archive').innerHTML="unarchive";
        document.querySelector('#archive').onclick = function(){
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
          })
          alert("email has been unarchived.");
          load_mailbox('inbox');
        } 
      }
      if (mailbox==='sent'){
        document.querySelector('#archive').style.display = 'none';
      }

      
      document.querySelector('#sender').innerHTML = `Sender: ${email.sender}`;
      document.querySelector('#recipient').innerHTML='Recipient: <br>';
      email.recipients.forEach(recipient => {
        document.querySelector('#recipient').innerHTML +=`${recipient} <br>`;
      });
      document.querySelector('#subject').innerHTML = `Subject: ${email.subject}`;
      document.querySelector('#body').innerHTML = `Body: ${email.body}`;
      document.querySelector('#timestamp').innerHTML = `Timestamp: ${email.timestamp}`;
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
      // ... do something else with email ...
  });
});
    document.querySelector('#emails-view').append(element);
    });
   
    console.log(emails);

    // ... do something else with emails ...
});

}

function reply(email,mailbox){

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-information').style.display = 'none';
 document.querySelector('#compose-view').style.display = 'block';
 document.querySelector('#compose-recipients').value = '';
 document.querySelector('#compose-subject').value = '';
 document.querySelector('#compose-body').value = '';

 if(mailbox==='sent'){
 for (i = 0; i < email.recipients.length; i++) {
  if(i+1===email.recipients.length){
    document.querySelector('#compose-recipients').value += `${email.recipients[i]}`;
    break;
  }
  document.querySelector('#compose-recipients').value += `${email.recipients[i]},`;
}
 }
 else{
  document.querySelector('#compose-recipients').value = email.sender;
 }

  if (email.subject.substring(0,3)==='Re:'){
    document.querySelector('#compose-subject').value = email.subject;
  }
  else{
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }
 document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

 document.querySelector('#compose-form').onsubmit = function() {
   var lol = 0;
   fetch('/emails', {
     method: 'POST',
     body: JSON.stringify({
         recipients: document.querySelector('#compose-recipients').value,
         subject: document.querySelector('#compose-subject').value,
         body: document.querySelector('#compose-body').value
     })
   })
   .then(response => {
     if(response.status===201){
        lol = 1;
        return response.json();
     }
     else{
       lol = 2;
       return response.json();
     }
   })
   .then(result => {
     
       if (lol===2){
         alert(result.error);
       }
       else{
         alert(result.message);
         load_mailbox('sent');
       }
       console.log(result);
   });
   return false;
 }
 
}
