export type QuestionOption = { A: string; B: string; C: string; D: string };

export type Question = {
  scenario?: string;
  text: string;
  options: QuestionOption;
};

export type ExamData = {
  version: "C" | "D";
  questions: Question[];
  answers: Record<number, keyof QuestionOption>;
};

const SCENARIO_67YO = "A 67-year-old man is found unresponsive, not breathing, and without a pulse. You and a second rescuer begin performing high-quality CPR.";
const SCENARIO_53YO = "A 53-year-old woman collapses while gardening. She is unresponsive, not breathing, and does not have a pulse. A neighbor, who is an emergency medical technician, rushes to her with an AED.";
const SCENARIO_INFANT = "An 8-month-old infant is eating a meal and suddenly begins to choke. The infant is unable to make any noise. You pick up the infant and shout for help.";
const SCENARIO_CHILD = "A 9-year-old child has suddenly collapsed. After confirming that the scene is safe, a single rescuer determines that the child is in cardiac arrest, shouts for nearby help, and activates the emergency response system by using a mobile device. The rescuer immediately begins performing high-quality CPR. Two additional rescuers arrive to assist.";
const SCENARIO_MAN = "A middle-aged man collapses. You and a second rescuer go to him and find that he is unresponsive, not breathing, and does not have a pulse.";

export const EXAM_C: ExamData = {
  version: "C",
  answers: {
    1: "C", 2: "D", 3: "A", 4: "D", 5: "B",
    6: "C", 7: "B", 8: "C", 9: "D", 10: "B",
    11: "C", 12: "A", 13: "C", 14: "B", 15: "A",
    16: "D", 17: "C", 18: "A", 19: "A", 20: "C",
    21: "B", 22: "D", 23: "A", 24: "D", 25: "A",
  },
  questions: [
    {
      scenario: SCENARIO_67YO,
      text: "When should rescuers switch positions during CPR?",
      options: {
        A: "Never switch rescuers during cardiac arrest",
        B: "When placing the AED pads on the chest",
        C: "About every 2 minutes",
        D: "At 5-minute intervals or when the compressor becomes fatigued",
      },
    },
    {
      scenario: SCENARIO_67YO,
      text: "You notice the person giving chest compressions is not allowing for complete chest recoil. What is your next course of action?",
      options: {
        A: "Stand back and await direction from the team leader",
        B: "Tell the rescuer that the compressions are wrong",
        C: "Immediately take over chest compressions",
        D: "Tell the compressor that you notice decreased chest recoil",
      },
    },
    {
      text: "\"The team functions smoothly when all team members know their positions, functions, and tasks during a resuscitation attempt.\" Match this statement with the most appropriate element of team dynamics.",
      options: {
        A: "Clear roles and responsibilities",
        B: "Knowing your limitations",
        C: "Constructive intervention",
        D: "Mutual respect",
      },
    },
    {
      text: "Early defibrillation is a link in the adult Chain of Survival. Why is this important to survival?",
      options: {
        A: "It prevents respiratory arrest",
        B: "It prevents cardiac arrest",
        C: "It provides normal respiration",
        D: "It eliminates the abnormal heart rhythm",
      },
    },
    {
      text: "What special circumstance should a rescuer consider when using an AED?",
      options: {
        A: "They should never use an AED on someone with an implanted pacemaker",
        B: "On a hairy chest, the AED pads may not stick and may fail to deliver a shock",
        C: "AEDs can only be used while a person is submerged in water",
        D: "They should never remove a transdermal medication patch before applying AED pads",
      },
    },
    {
      scenario: SCENARIO_53YO,
      text: "When the AED arrives, what is the first step for using it?",
      options: {
        A: "Apply the pads to the chest",
        B: "Press the Shock button",
        C: "Turn on the AED",
        D: "Clear the victim",
      },
    },
    {
      scenario: SCENARIO_53YO,
      text: "The AED pads have been attached to the victim. The AED detects ventricular fibrillation. What is the next step when using an AED?",
      options: {
        A: "Check for a carotid pulse",
        B: "Follow the AED prompts",
        C: "Clear the victim",
        D: "Press the Shock button",
      },
    },
    {
      scenario: SCENARIO_53YO,
      text: "What should you do if you need to use an AED on someone who has been submerged in water?",
      options: {
        A: "Do not pull the victim out of the water, and wipe the chest dry",
        B: "Pull the victim out of the water, but do not use the AED",
        C: "Pull the victim out of the water, and wipe the chest dry",
        D: "Do not pull the victim out of the water, and do not use the AED",
      },
    },
    {
      text: "Why is defibrillation important?",
      options: {
        A: "It is not important for survival after cardiac arrest",
        B: "It prevents rearrest from occurring",
        C: "There is a 100% success rate if performed within the first few minutes",
        D: "It can restore a regular cardiac rhythm",
      },
    },
    {
      text: "Which adult victim requires high-quality CPR?",
      options: {
        A: "Has normal breathing and has a pulse",
        B: "Has no normal breathing and no pulse",
        C: "Has a pulse and is having trouble breathing",
        D: "Has a strong pulse but is not breathing normally",
      },
    },
    {
      text: "Why is allowing complete chest recoil important when performing high-quality CPR?",
      options: {
        A: "There will be a reduction of rescuer fatigue during CPR",
        B: "The rate of chest compressions will increase",
        C: "The heart will adequately refill with blood between compressions",
        D: "It will reduce the risk of rib fractures during CPR",
      },
    },
    {
      scenario: SCENARIO_MAN,
      text: "Which action is most likely to positively impact survival?",
      options: {
        A: "Performing high-quality CPR",
        B: "Providing rescue breaths first",
        C: "Ensuring scene safety before beginning CPR",
        D: "Checking the pulse frequently",
      },
    },
    {
      scenario: SCENARIO_MAN,
      text: "You and another rescuer begin CPR. After a few cycles, you notice that the rate of chest compressions is slowing. What should you say to offer constructive feedback?",
      options: {
        A: "\"You need to compress at a rate of 80 to 120/min\"",
        B: "\"You need to compress at a rate of at least 100/min\"",
        C: "\"You need to compress at a rate of 100 to 120/min\"",
        D: "\"You need to compress at a rate of at least 120/min\"",
      },
    },
    {
      scenario: SCENARIO_INFANT,
      text: "You have determined that the infant is responsive but is choking with a severe airway obstruction. How do you relieve the obstruction?",
      options: {
        A: "Give abdominal thrusts",
        B: "Give 5 back slaps followed by 5 chest thrusts, and repeat until the object is cleared or the infant becomes unresponsive",
        C: "Begin 2 thumb–encircling hands chest compressions",
        D: "Encourage the infant to cough",
      },
    },
    {
      scenario: SCENARIO_INFANT,
      text: "The infant becomes unresponsive. Which action should you perform to relieve choking in an unresponsive infant?",
      options: {
        A: "Perform CPR, and look in the mouth for the obstructing object before you give each breath",
        B: "Attempt a blind finger sweep when giving rescue breaths to remove the obstructing object",
        C: "Give 5 back slaps followed by 5 chest thrusts, and repeat until the object is cleared",
        D: "Give 5 abdominal thrusts followed by 5 back slaps, and repeat until the object is cleared",
      },
    },
    {
      text: "What ratio for compressions to breaths should be used for 1-rescuer infant CPR?",
      options: {
        A: "Give 15 compressions to 2 breaths",
        B: "Give 20 compressions to 2 breaths",
        C: "Give 5 compressions to 1 breath",
        D: "Give 30 compressions to 2 breaths",
      },
    },
    {
      text: "When you are performing CPR on an unresponsive person who you know is choking, what modification should you incorporate?",
      options: {
        A: "There are no modifications to CPR for an unresponsive choking victim",
        B: "You should attempt a jaw thrust instead of a head tilt–chin lift to open the airway",
        C: "Each time you open the airway, you look for the obstructing object before giving a breath",
        D: "You should not give rescue breaths to an unresponsive choking victim",
      },
    },
    {
      text: "How can rescuers ensure that they are providing effective breaths when using a bag-mask device?",
      options: {
        A: "Observing the chest rise with each breath",
        B: "Always having supplemental oxygen attached to the bag",
        C: "Delivering breaths quickly and with great force",
        D: "Allowing air to release around the mask during ventilation",
      },
    },
    {
      text: "Which characteristics of chest compressions in high-quality CPR are given to a child?",
      options: {
        A: "At least one third the depth of the chest, approximately 2 inches (5 cm)",
        B: "At least one fourth the depth of the chest, approximately 1½ inches (4 cm)",
        C: "At least two thirds the depth of the chest, approximately 4 inches (10 cm)",
        D: "At least one half the depth of the chest, approximately 3 inches (8 cm)",
      },
    },
    {
      scenario: SCENARIO_CHILD,
      text: "What actions should occur next to support a team-based resuscitation attempt?",
      options: {
        A: "Two rescuers should alternate using the AED and providing rescue breaths",
        B: "Two rescuers should operate the AED while the third rescuer provides rescue breaths",
        C: "Two rescuers should alternate giving high-quality chest compressions while the third rescuer provides rescue breaths",
        D: "One rescuer should continue giving CPR while the other 2 rescuers wait for advanced life support to arrive",
      },
    },
    {
      scenario: SCENARIO_CHILD,
      text: "Two rescuers begin high-quality CPR while the third rescuer leaves to get the AED. What action supports 2-rescuer CPR?",
      options: {
        A: "Alternating the AED operator role every 2 minutes",
        B: "Alternating the compressor role every 2 minutes",
        C: "Alternating who gives the shock every 3 cycles",
        D: "Alternating who gives rescue breaths every 3 cycles",
      },
    },
    {
      text: "While performing high-quality CPR on an adult, what action should you ensure is being accomplished?",
      options: {
        A: "Allowing the chest to recoil to at least 1 inch between compressions",
        B: "Placing the hands on the upper third of the sternum",
        C: "Maintaining a compression rate of 90 to 120/min",
        D: "Compressing the chest to a depth of at least 2 inches",
      },
    },
    {
      text: "A victim with a foreign-body airway obstruction becomes unresponsive. What is your first course of action?",
      options: {
        A: "Start CPR, beginning with chest compressions",
        B: "Roll the victim over and perform back blows",
        C: "Perform abdominal thrusts",
        D: "Perform blind finger sweeps",
      },
    },
    {
      text: "\"Members of the team know their boundaries and ask for assistance before a resuscitation attempt worsens.\" Match this statement with the most appropriate element of team dynamics.",
      options: {
        A: "Knowledge sharing",
        B: "Summarizing and reevaluation",
        C: "Constructive intervention",
        D: "Knowing your limitations",
      },
    },
    {
      text: "You witness someone suddenly collapse. The person is unresponsive. You hear occasional gasping sounds and there is no pulse. You phone 9-1-1. What should you do next?",
      options: {
        A: "Begin CPR; the gasps are not normal breathing",
        B: "Give rescue breaths only; the gasps are not normal breathing",
        C: "Begin CPR even though gasping is considered normal breathing",
        D: "Monitor the patient; the gasps are considered normal breathing",
      },
    },
  ],
};

export const EXAM_D: ExamData = {
  version: "D",
  answers: {
    1: "A", 2: "A", 3: "A", 4: "B", 5: "A",
    6: "C", 7: "B", 8: "D", 9: "B", 10: "C",
    11: "C", 12: "A", 13: "C", 14: "C", 15: "D",
    16: "B", 17: "A", 18: "C", 19: "D", 20: "D",
    21: "D", 22: "A", 23: "C", 24: "B", 25: "D",
  },
  questions: [
    {
      text: "A victim with a foreign-body airway obstruction becomes unresponsive. What is your first course of action?",
      options: {
        A: "Start CPR, beginning with chest compressions",
        B: "Roll the victim over and perform back blows",
        C: "Perform abdominal thrusts",
        D: "Perform blind finger sweeps",
      },
    },
    {
      text: "How can rescuers ensure that they are providing effective breaths when using a bag-mask device?",
      options: {
        A: "Observing the chest rise with each breath",
        B: "Always having supplemental oxygen attached to the bag",
        C: "Delivering breaths quickly and with great force",
        D: "Allowing air to release around the mask during ventilation",
      },
    },
    {
      text: "Which characteristics of chest compressions in high-quality CPR are given to a child?",
      options: {
        A: "At least one third the depth of the chest, approximately 2 inches (5 cm)",
        B: "At least one half the depth of the chest, approximately 3 inches (8 cm)",
        C: "At least two thirds the depth of the chest, approximately 4 inches (10 cm)",
        D: "At least one fourth the depth of the chest, approximately 1½ inches (4 cm)",
      },
    },
    {
      text: "Which adult victim requires high-quality CPR?",
      options: {
        A: "Has normal breathing and has a pulse",
        B: "Has no normal breathing and no pulse",
        C: "Has a pulse and is having trouble breathing",
        D: "Has a strong pulse but is not breathing normally",
      },
    },
    {
      text: "You witness someone suddenly collapse. The person is unresponsive. You hear occasional gasping sounds and there is no pulse. You phone 9-1-1. What should you do next?",
      options: {
        A: "Begin CPR; the gasps are not normal breathing",
        B: "Give rescue breaths only; the gasps are not normal breathing",
        C: "Monitor the patient; the gasps are considered normal breathing",
        D: "Begin CPR even though gasping is considered normal breathing",
      },
    },
    {
      scenario: SCENARIO_53YO,
      text: "When the AED arrives, what is the first step for using it?",
      options: {
        A: "Apply the pads to the chest",
        B: "Clear the victim",
        C: "Turn on the AED",
        D: "Press the Shock button",
      },
    },
    {
      scenario: SCENARIO_53YO,
      text: "The AED pads have been attached to the victim. The AED detects ventricular fibrillation. What is the next step when using an AED?",
      options: {
        A: "Press the Shock button",
        B: "Follow the AED prompts",
        C: "Check for a carotid pulse",
        D: "Clear the victim",
      },
    },
    {
      text: "What ratio for compressions to breaths should be used for 1-rescuer infant CPR?",
      options: {
        A: "Give 20 compressions to 2 breaths",
        B: "Give 5 compressions to 1 breath",
        C: "Give 15 compressions to 2 breaths",
        D: "Give 30 compressions to 2 breaths",
      },
    },
    {
      text: "What special circumstance should a rescuer consider when using an AED?",
      options: {
        A: "AEDs can only be used while a person is submerged in water",
        B: "On a hairy chest, the AED pads may not stick and may fail to deliver a shock",
        C: "They should never remove a transdermal medication patch before applying AED pads",
        D: "They should never use an AED on someone with an implanted pacemaker",
      },
    },
    {
      text: "Why is allowing complete chest recoil important when performing high-quality CPR?",
      options: {
        A: "There will be a reduction of rescuer fatigue during CPR",
        B: "The rate of chest compressions will increase",
        C: "The heart will adequately refill with blood between compressions",
        D: "It will reduce the risk of rib fractures during CPR",
      },
    },
    {
      text: "What should you do if you need to use an AED on someone who has been submerged in water?",
      options: {
        A: "Pull the victim out of the water, but do not use the AED",
        B: "Do not pull the victim out of the water, and do not use the AED",
        C: "Pull the victim out of the water, and wipe the chest dry",
        D: "Do not pull the victim out of the water, and wipe the chest dry",
      },
    },
    {
      scenario: SCENARIO_MAN,
      text: "Which action is most likely to positively impact survival?",
      options: {
        A: "Performing high-quality CPR",
        B: "Ensuring scene safety before beginning CPR",
        C: "Checking the pulse frequently",
        D: "Providing rescue breaths first",
      },
    },
    {
      scenario: SCENARIO_MAN,
      text: "You and another rescuer begin CPR. After a few cycles, you notice that the rate of chest compressions is slowing. What should you say to offer constructive feedback?",
      options: {
        A: "\"You need to compress at a rate of 80 to 120/min\"",
        B: "\"You need to compress at a rate of at least 100/min\"",
        C: "\"You need to compress at a rate of 100 to 120/min\"",
        D: "\"You need to compress at a rate of at least 120/min\"",
      },
    },
    {
      scenario: SCENARIO_67YO,
      text: "When should rescuers switch positions during CPR?",
      options: {
        A: "Never switch rescuers during cardiac arrest",
        B: "When placing the AED pads on the chest",
        C: "About every 2 minutes",
        D: "At 5-minute intervals or when the compressor becomes fatigued",
      },
    },
    {
      scenario: SCENARIO_67YO,
      text: "You notice the person giving chest compressions is not allowing for complete chest recoil. What is your next course of action?",
      options: {
        A: "Stand back and await direction from the team leader",
        B: "Tell the rescuer that the compressions are wrong",
        C: "Immediately take over chest compressions",
        D: "Tell the compressor that you notice decreased chest recoil",
      },
    },
    {
      scenario: SCENARIO_INFANT,
      text: "You have determined that the infant is responsive but is choking with a severe airway obstruction. How do you relieve the obstruction?",
      options: {
        A: "Give abdominal thrusts",
        B: "Give 5 back slaps followed by 5 chest thrusts, and repeat until the object is cleared or the infant becomes unresponsive",
        C: "Encourage the infant to cough",
        D: "Begin 2 thumb–encircling hands chest compressions",
      },
    },
    {
      scenario: SCENARIO_INFANT,
      text: "The infant becomes unresponsive. Which action should you perform to relieve choking in an unresponsive infant?",
      options: {
        A: "Perform CPR, and look in the mouth for the obstructing object before you give each breath",
        B: "Attempt a blind finger sweep when giving rescue breaths to remove the obstructing object",
        C: "Give 5 abdominal thrusts followed by 5 back slaps, and repeat until the object is cleared",
        D: "Give 5 back slaps followed by 5 chest thrusts, and repeat until the object is cleared",
      },
    },
    {
      text: "When you are performing CPR on an unresponsive person who you know is choking, what modification should you incorporate?",
      options: {
        A: "There are no modifications to CPR for an unresponsive choking victim",
        B: "You should attempt a jaw thrust instead of a head tilt–chin lift to open the airway",
        C: "Each time you open the airway, you look for the obstructing object before giving a breath",
        D: "You should not give rescue breaths to an unresponsive choking victim",
      },
    },
    {
      text: "While performing high-quality CPR on an adult, what action should you ensure is being accomplished?",
      options: {
        A: "Maintaining a compression rate of 90 to 120/min",
        B: "Placing the hands on the upper third of the sternum",
        C: "Allowing the chest to recoil to at least 1 inch between compressions",
        D: "Compressing the chest to a depth of at least 2 inches",
      },
    },
    {
      text: "Early defibrillation is a link in the adult Chain of Survival. Why is this important to survival?",
      options: {
        A: "It prevents respiratory arrest",
        B: "It provides normal respiration",
        C: "It prevents cardiac arrest",
        D: "It eliminates the abnormal heart rhythm",
      },
    },
    {
      text: "Why is defibrillation important?",
      options: {
        A: "It prevents rearrest from occurring",
        B: "It is not important for survival after cardiac arrest",
        C: "There is a 100% success rate if performed within the first few minutes",
        D: "It can restore a regular cardiac rhythm",
      },
    },
    {
      text: "\"The team functions smoothly when all team members know their positions, functions, and tasks during a resuscitation attempt.\" Match this statement with the most appropriate element of team dynamics.",
      options: {
        A: "Clear roles and responsibilities",
        B: "Mutual respect",
        C: "Constructive intervention",
        D: "Knowing your limitations",
      },
    },
    {
      scenario: SCENARIO_CHILD,
      text: "What actions should occur next to support a team-based resuscitation attempt?",
      options: {
        A: "Two rescuers should alternate using the AED and providing rescue breaths",
        B: "One rescuer should continue giving CPR while the other 2 rescuers wait for advanced life support to arrive",
        C: "Two rescuers should alternate giving high-quality chest compressions while the third rescuer provides rescue breaths",
        D: "Two rescuers should operate the AED while the third rescuer provides rescue breaths",
      },
    },
    {
      scenario: SCENARIO_CHILD,
      text: "Two rescuers begin high-quality CPR while the third rescuer leaves to get the AED. What action supports 2-rescuer CPR?",
      options: {
        A: "Alternating the AED operator role every 2 minutes",
        B: "Alternating the compressor role every 2 minutes",
        C: "Alternating who gives the shock every 3 cycles",
        D: "Alternating who gives rescue breaths every 3 cycles",
      },
    },
    {
      text: "\"Members of the team know their boundaries and ask for assistance before a resuscitation attempt worsens.\" Match this statement with the most appropriate element of team dynamics.",
      options: {
        A: "Knowledge sharing",
        B: "Constructive intervention",
        C: "Summarizing and reevaluation",
        D: "Knowing your limitations",
      },
    },
  ],
};

export const EXAMS: Record<"C" | "D", ExamData> = { C: EXAM_C, D: EXAM_D };
