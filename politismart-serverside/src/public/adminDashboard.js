let loggedInUser = window.localStorage.getItem("pediatrician-username");
let loggedInJwt = window.localStorage.getItem("pediatrician-jwt");
$('.logged-in-as').text(`Logged in as: ${loggedInUser}`);

////////GETTING AND DISPLAYING CLIENT'S KIDS (PATIENTS) - START//////////
//This function gets all patients that have this user as their parent or guardian
function getPatientsByGuardian(callbackFn) {
    let patientJsonUrl = '/patients/';
    var settings = {
        "url": patientJsonUrl,
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "authorization": "Bearer " + loggedInJwt
        }
    }
    $.ajax(settings).done(function (response) {
      callbackFn(response);
    })
    .error(e => { `Bad API connection` });
}

function displayPatientButtons(data) {
    $('.patient-buttons').html(''); //clearing the previous buttons
    for (index in data.patients) {
        $('.patient-buttons').append( //adding the patientId as the second class of the button(use in onclick later)
        `<button class="patient-button ${data.patients[index].id} ${data.patients[index].fullName} service-btn">${data.patients[index].fullName}</button>`);
    }
}

const getAndDisplayPatientButtons = new Promise((resolve, reject) => {
    resolve(getPatientsByGuardian(displayPatientButtons));
});
////////GETTING AND DISPLAYING CLIENT'S KIDS (PATIENTS) - END//////////


//A patient button listener that logs the unique patient ID of the selected patient
function logPatientIdFromButton() {
    $('.patient-buttons').on('click', '.patient-button', event => { //need event deleation here, b/c patient-button doesn't exist upon initial page load
        $('.results-display').html(''); //wiping old results when selecting a new patient 
        currentPatientId = $(event.currentTarget).attr('class').split(' ')[1]; //the second class was set to be the unique patientId
        currentPatientName = $(event.currentTarget).attr('class').split(' ')[2]; //the third class was set to be the patient's fullName
        $('.patient-button').css("border", "1px solid #5b6f37");
        $(event.currentTarget).css("border", "2px solid red");
    });
}


////////GETTING AND DISPLAYING VACCINES - START//////////
function getVaccinesByPatient(callbackFn) {
    let vaccineJsonUrl = '/vaccines/byPatient/' + currentPatientId;
    var settings = {
        "url": vaccineJsonUrl,
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "authorization": "Bearer " + loggedInJwt
        }
    }
    $.ajax(settings).done(function (response) {
      callbackFn(response);
    })
    .error(e => { `Bad API connection or invalid patient ID` });  
}

function displayVaccineList(data) {
    $('.results-display').html(''); //clearing the results area between clicks
    if (data.vaccines[0] == undefined) {
        $('.results-display').html(
            '<div class="patient-name-or-no-results-msg">Our staff has not updated any vaccines for this patient yet.</div>')
    } else {

        //creating the title row for the results table:
        $('.results-display').html(
            '<div class="patient-name-or-no-results-msg">Vaccine history for: ' + data.vaccines[0].patientName + '</div>' +
            '<table>' +
                '<tr>' +
                    '<th class="col1-vacs">Vaccine</th>' +
                    '<th class="col2-vacs">Status</th>' +
                    '<th class="col3-vacs">Due Date</th>' +
                    '<th class="col4-vacs">Done Date</th>' +
                '</tr>' +
            '</table>'
        ); 
        //creating each row in the table:
        for (index in data.vaccines) {
            $('.results-display').append(
                '<table>' +    
                    '<tr>' +
                        '<td class="col1-vacs">' + data.vaccines[index].vaccineName + '<br>' +
                        data.vaccines[index].relatedDiseases + '<br>' +
                        'Vaccine ID: ' + data.vaccines[index].id + '</td>' +
                        '<td class="col2-vacs">' + data.vaccines[index].vaccineStatus + '</td>' +
                        '<td class="col3-vacs">' + formatDate(data.vaccines[index].dueDate) + '</td>' +
                        '<td class="col4-vacs">' + formatDate(data.vaccines[index].doneDate) + '</td>' +
                    '</tr>' +
                '</table>'
            );
        }
    }
}

function getAndDisplayVaccinesByPatient() {
    getVaccinesByPatient(displayVaccineList);
}

//An event listener for a vaccine request (only after patient selection):
function vaccineListener() {
    $('.vaccines-button').click( event => { 
        getAndDisplayVaccinesByPatient();
        $('.srvc-btn-brdr-toggle').css("border", "1px solid #5b6f37");
        $(event.currentTarget).css("border", "2px solid red");
        $('.add-vaccine-box').css("display","none");  //clearing any unclicked forms, so they don't remain on screen
        $('.add-appointment-box').css("display","none");  //clearing any unclicked forms, so they don't remain on screen
        $('.add-vaccine-box').css("display","none");  //in case user didn't click submit on the other form
    })
}

function formatDate(date) {
    return date.slice(5,7) + "/" + date.slice(8,10) + "/" + date.slice(2,4);
}
////////GETTING AND DISPLAYING VACCINES - END//////////

////////GETTING AND DISPLAYING APPOINTMENTS - START//////////
function getAppointmentsByPatient(callbackFn) {
    let appointmentsJsonUrl = '/appointments/byPatient/' + currentPatientId;
    var settings = {
        "url": appointmentsJsonUrl,
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "authorization": "Bearer " + loggedInJwt
        }
    }
    $.ajax(settings).done(function (response) {
      callbackFn(response);
    })
    .error(e => { `Bad API connection or invalid patient ID` });  
}

function displayAppointmentsList(data) {
    $('.results-display').html(''); //clearing the results area between clicks
    if (data.appointments[0] == undefined) {
        $('.results-display').html(
            '<div class="patient-name-or-no-results-msg">Our staff has not updated any appointments for this patient yet.</div>')
    } else {
        //creating the title row for the results table:
        $('.results-display').html(
            '<div class="patient-name-or-no-results-msg">Past & future visits log for: ' + data.appointments[0].patientName + '</div>' +
            '<table>' +
                '<tr>' +
                    '<th class="col1-apnts">Date</th>' +
                    '<th class="col2-apnts">Reason</th>' +
                    '<th class="col3-apnts">Summary</th>' +
                '</tr>'
        ); 
        //creating each row in the table:
        for (index in data.appointments) {
            $('.results-display').append(
                '<table>' +    
                    '<tr>' +
                        '<td class="col1-apnts">' + formatDate(data.appointments[index].date) + '<br>' +
                        // 'Appointment ID: ' + data.appointments[index].id + '</td>' +
                        '<td class="col2-apnts">' + data.appointments[index].reason + '</td>' +
                        '<td class="col3-apnts">' + data.appointments[index].summary + '</td>' +
                    '</tr>' +
                '</table>'
            );
        }
    }
}

function getAndDisplayAppointmentsByPatient() {
    getAppointmentsByPatient(displayAppointmentsList);
}

//An event listener for an appointment request (only after patient selection):
function appointmentListener() {
    $('.appointment-button').click( event => { 
        getAndDisplayAppointmentsByPatient();
        $('.srvc-btn-brdr-toggle').css("border", "1px solid #5b6f37");
        $(event.currentTarget).css("border", "2px solid red");
        $('.add-vaccine-box').css("display","none");  //clearing any unclicked forms, so they don't remain on screen
        $('.add-appointment-box').css("display","none");  //clearing any unclicked forms, so they don't remain on screen
    })
}
////////GETTING AND DISPLAYING APPOINTMENTS - END//////////

////////GETTING AND DISPLAYING PATIENT INFO - START//////////
function getPatientInfo(callbackFn) {
    let patientJsonUrl = '/patients/byPatientId/' + currentPatientId;
    var settings = {
        "url": patientJsonUrl,
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "authorization": "Bearer " + loggedInJwt
        }
    }
    $.ajax(settings).done(function (response) {
      callbackFn(response);
    })
    .error(e => { `Bad API connection or invalid patient ID` });  
}

function displayPatientInfo(data) {
    $('.results-display').html(''); //clearing the results area between clicks
    //creating the title row for the results table:
    $('.results-display').html(
        '<div class="patient-name-or-no-results-msg">Patient information for: ' + data.fullName + '</div>' +
        '<div class="patient-details-display">' + 
            'Patient name: ' + data.fullName + '<br>' +
            'Date of birth: ' +  formatDate(data.dob) + '<br>' +
            'Age: ' + getAge(data.dob) + ' Years<br>' +
            'Gender: ' + data.gender + '<br>' +
            'Guardians: ' + data.guardians + '<br>' +
        '</div>'
    ); 
}

function getAndDisplayPatientInfo() {
    getPatientInfo(displayPatientInfo);
}

//An event listener for a vaccine request (only after patient selection):
function patientInfoListener() {
    $('.patient-info-button').click( event => { 
        getAndDisplayPatientInfo();
        $('.srvc-btn-brdr-toggle').css("border", "1px solid #5b6f37");
        $(event.currentTarget).css("border", "2px solid red");
        $('.add-vaccine-box').css("display","none");  //clearing any unclicked forms, so they don't remain on screen
        $('.add-appointment-box').css("display","none");  //clearing any unclicked forms, so they don't remain on screen
    })
}

function getAge(dobString) {
    let date1 = new Date(Date.now());
    let date2 = new Date(formatDate(dobString));
    let timeDiff = date1 - date2;
    let diffDays = (timeDiff / (1000 * 3600 * 24 * 365)).toFixed(1); 
    return diffDays;
}
////////GETTING AND DISPLAYING  PATIENT INFO - END//////////

////////LISTENING TO THE LOGOUT BUTTON - START//////////
$('.log-out-button').click( event => {
    //clearing local storage of credentials
    window.localStorage.removeItem("pediatrician-username");
    window.localStorage.removeItem("pediatrician-jwt");  
    //sending user back to login page
    window.location.href='/index.html';
});
////////LISTENING TO THE LOGOUT BUTTON - END//////////

////////LISTENING TO ADD VACCINE BUTTON - START//////////
//show the hidden form if the button is clicked
$('.patient-vaccine-add').click( event => {
    $('.add-appointment-box').css("display","none"); //in case user didn't click submit on the other form
    $('.add-vaccine-box').toggle();
    $('.srvc-btn-brdr-toggle').css("border", "1px solid #5b6f37");
    $(event.currentTarget).css("border", "2px solid red");
})

//Sending the API request and re-hiding the form when done
$('.add-vaccine-form').submit( event => {
    event.preventDefault();
    //Sending API POST to register new child:
    let vaccineName = $('.vaccine-name-input').val();
    let vaccineStatus = $('.vaccine-status-input').val();
    let patientName = currentPatientName;
    let patientId = currentPatientId;
    let relatedDiseases = $('.related-diseases-input').val();
    let dueDate = $('.vaccine-due-date').val();
    let doneDate = $('.vaccine-done-date').val();
    var settings = {
      "url": "/vaccines/",
      "method": "POST",
      "headers": {
        "content-type": "application/json",
        "authorization": "Bearer " + loggedInJwt
      },
      "data": `{"vaccineName": "${vaccineName}",
                "vaccineStatus": "${vaccineStatus}",
                "patientId": "${patientId}",
                "relatedDiseases": "${relatedDiseases}",
                "dueDate": ${new Date(dueDate).getTime()},
                "doneDate": ${new Date(doneDate).getTime()}} `
    }
    $.ajax(settings).done(function (response) {
      console.log(response);
      $('.add-vaccine-box').toggle();
      //Reload the page with the new child:
      location.reload();
    })
    .error(e => { `Bad API connection` });    
});

////////LISTENING TO THE ADD VACCINE BUTTON - END//////////

////////LISTENING TO ADD APPOINTMENT BUTTON - START//////////
//show the hidden form if the button is clicked
$('.patient-appointment-add').click( event => {
    $('.add-vaccine-box').css("display","none");  //in case user didn't click submit on the other form
    $('.add-appointment-box').toggle();
    $('.srvc-btn-brdr-toggle').css("border", "1px solid #5b6f37");
    $(event.currentTarget).css("border", "2px solid red");
     
})

//Sending the API request and re-hiding the form when done
$('.add-appointment-form').submit( event => {
    event.preventDefault();
    //Sending API POST to register new child:
    let patientName = currentPatientName;
    let patientId = currentPatientId;
    let date = $('.appointment-date-input').val();
    let reason = $('.appointment-reason-input').val();
    let summary = $('.appointment-summary-input').val();
    var settings = {
      "url": "/appointments/",
      "method": "POST",
      "headers": {
        "content-type": "application/json",
        "authorization": "Bearer " + loggedInJwt
      },
      "data": `{"patientName": "${patientName}",
                "patientId": "${patientId}",
                "date": ${new Date(date).getTime()},
                "reason": "${reason}",
                "summary": "${summary}"} `
    }
    $.ajax(settings).done(function (response) {
      console.log(response);
      $('.add-appointment-box').toggle();
      //Reload the page with the new child:
      location.reload();
    })
    .error(e => { `Bad API connection` });    
});

////////LISTENING TO THE ADD APPOINTMENT BUTTON - END//////////




let currentPatientId; //this variable is updated upon patient selection in logPatientIdFromButton
let currentPatientName;
$(function() {
    getAndDisplayPatientButtons
    .then(logPatientIdFromButton)
    .then(vaccineListener)
    .then(appointmentListener)
    .then(patientInfoListener)
})

