### Chalmers Calendar

This project aims to create a way for chalmers students to easily subscribe to their course schedules. 
The idea is to create personal webcal urls that includes the users chalmers credentials that students can subscribe 
to in for example Google Calendar. 

Each time the calendar software fetches events from the webcal a web service will fetch required information. 
First the student's current registered courses will be fetched from the student portal and then the schedule 
for those courses will be fetched from TimeEdit.

### Deploy
`rsync -a . root@flown.io:~/sites/chalmershacks.flown.io`

### Contribute

### Progress
Will be able to use _trust request. Maybe I have to use previous request to generate the Signature, but otherwise should be fine!