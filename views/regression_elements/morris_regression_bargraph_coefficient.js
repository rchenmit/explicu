new Morris.Bar({
  // ID of the element in which to draw the chart.
  element: 'regression_bargraph_coefficient',
  // Chart data records -- each entry in this array corresponds to a point on
  // the chart.
/*
  data: [
      { comorbidity: 'Peptic ulcer disease', coefficient: 0 },
      { comorbidity: 'Liver disease',  coefficient: -0.4255},
      { comorbidity: 'Hypertension, uncomplicated', coefficient: -0.4255 },
      { comorbidity: 'Psychosis', coefficient: -0.1126 },
      { comorbidity: 'AIDS/HIV', coefficient: -0.7350 },
      { comorbidity: 'Hypertension,complicated', coefficient: -0.7350 },
      { comorbidity: 'Hypothyroidism', coefficient: -0.6273 },
      { comorbidity: 'Cardiac arrhythmia', coefficient: -0.1555 },
      { comorbidity: 'Depression', coefficient: -0.2501 },
      { comorbidity: 'Neurological, other', coefficient: 1.7463 },
      { comorbidity: 'Lymphoma', coefficient: 1.6913 }
  ], */
data: [
  {
    "Comorbidity":"Liver Disease",
    "Coefficient":-0.425493091
  },
  {
    "Comorbidity":"Hypertension-Uncomplicated",
    "Coefficient":0.077228413
  },
  {
    "Comorbidity":"Psychoses",
    "Coefficient":-0.11256534
  },
  {
    "Comorbidity":"AIDS/HIV",
    "Coefficient":-0.735049467
  },
  {
    "Comorbidity":"Hypertension-Complicated",
    "Coefficient":0
  },
  {
    "Comorbidity":"Hypothyroidism",
    "Coefficient":0.627327171
  },
  {
    "Comorbidity":"Cardiac arrhythmia",
    "Coefficient":-0.155505255
  },
  {
    "Comorbidity":"Depression",
    "Coefficient":-0.250060439
  },
  {
    "Comorbidity":"Neurological-Other",
    "Coefficient":1.746332914
  },
  {
    "Comorbidity":"Lymphoma",
    "Coefficient":1.691251726
  },
  {
    "Comorbidity":"Rheumatoid Arthritis",
    "Coefficient":-0.523086242
  },
  {
    "Comorbidity":"Pulmonary Circulation Disorders",
    "Coefficient":-0.411224964
  },
  {
    "Comorbidity":"Kidney Failure",
    "Coefficient":0.641348796
  },
  {
    "Comorbidity":"Fluid and Electrolyte Disorders",
    "Coefficient":0.918685179
  },
  {
    "Comorbidity":"Diabetes-Complicated",
    "Coefficient":-0.176414644
  },
  {
    "Comorbidity":"Diabetes-Uncomplicated",
    "Coefficient":-0.36456906
  },
  {
    "Comorbidity":"Chronic Pulmonary Disease",
    "Coefficient":0.558703419
  },
  {
    "Comorbidity":"Congestive Heart Failure",
    "Coefficient":1.172734223
  },
  {
    "Comorbidity":"Coagulopathy",
    "Coefficient":0.717115404
  },
  {
    "Comorbidity":"Peripheral Vascular Disorders",
    "Coefficient":0.38310612
  },
  {
    "Comorbidity":"Deficiency Anemia",
    "Coefficient":-0.157800666
  },
  {
    "Comorbidity":"Tumor Without Metastasis",
    "Coefficient":0.479488301
  },
  {
    "Comorbidity":"Metastatic Cancer",
    "Coefficient":2.603331069
  },
  {
    "Comorbidity":"Valvular Disease",
    "Coefficient":0
  },
  {
    "Comorbidity":"Paralysis",
    "Coefficient":0.762004943
  },
  {
    "Comorbidity":"Weight Loss",
    "Coefficient":1.456982889
  },
  {
    "Comorbidity":"Obesity",
    "Coefficient":0
  },
  {
    "Comorbidity":"Blood Loss Anemia",
    "Coefficient":1.396010672
  }
],
  // The name of the data record attribute that contains x-values.
  xkey: 'Comorbidity',
  // A list of names of data record attributes that contain y-values.
  ykeys: ['Coefficient'],
  // Labels for the ykeys -- will be displayed when you hover over the
  // chart.
  labels: ['regression coefficient for this covariate']
});
