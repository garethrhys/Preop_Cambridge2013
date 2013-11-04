Electronic Pre-operative Assessment Questionnaire
===================

This project was started @NHSHD Cambridge, November 2nd-3rd, 2013.

Brief overview at <https://drive.google.com/file/d/0B809iUpcAl-RTmJEZ1pEcGprNkU/edit?usp=sharing>

Overview
--------

Patients scheduled to undergo planned surgery, require a thorough review in the weeks to months preceeding admission. The aims are,

1. To quantify risk of surgery for the patient, and establish if proposed procedure is best option in light of these risks,
2. To identify medical issues which may require treatment or optimisation before surgery,
3. To identify patient-specific requirements on the day of surgery, and facilitate planning of specific anaesthetic or surgical equipment, personnel, etc.
4. To identify changes to the patient's usual treatment around the time of surgery (e.g. Antiplatelet agents such as Aspirin),
5. To establish patient's social circumstances in order to establish appropriate care and facilities for patient after surgery
6. To provide information to the patient, including all of the above.


The overall aim is to **reduce delays or cancellations on the day of surgery**, to minimise patient dissatisfaction, and maintain maximum theatre utilisation.

###The system as it stands###

Patients booked for surgery are sent an appointment letter to attend a pre-admission or pre-operative assessment clinic (POAC), some weeks in advance of their surgery date. They are also sent a paper questionnaire to complete, which they are required to bring with them to clinic.

The questionnaire is reviewed and if no issues are identified **the patient does not need to see a healthcare professsional until the day of surgery**. This is inefficient for both the patient (having to take time off work, travelling to the hospital, etc.) and for the clinic staff.

##The aims of this project##
To provide an electronic alternative to the paper-based assessment questionnaire.

**This is not a substitute for the current system** but aims to give patients *the option* of completing their questionnaire electronically, at their convenience, and possibly preventing the need for attendance at clinic.

###The challenges###
One of the key barriers to implementation of a system is patient data security. A web-facing data collection system must transfer data securely to the relevant hospital department.

##Our solution##
- A question set is sent to the browser as a JSON object in a single HTTP request.
- Questions are displayed using javascript (AngularJS) conditionally based upon previous answers.
- Specific answers may be flagged if they require review as a priority
- Free-text may be added to individual questions if patients wish to elaborate on a radio-list / checklist option.
- All answers are **encrypted in the browser** using a public key
- A second app **with private key held within the hospital**, is used to decrypt the data, and format it, highlighting flagged fields.
