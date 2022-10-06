step1=00;
step2=parseInt(step1/4);
step3 = step2 + step1; 
step4 = 3; // Not Jan, so look at month before on table
step6 = step4 + step3; // 
step7 = step6 + 21;
// Step8 total 24
step9 = step7 - 2; 
if(step7 > 7) {
    step9%7;
    console.log(step9%7)
}