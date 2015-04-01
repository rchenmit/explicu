new Morris.Bar({
  // ID of the element in which to draw the chart.
  element: 'regression_bargraph_pvalue',
  // Chart data records -- each entry in this array corresponds to a point on
  // the chart.
  data:  [
	{"Comorbidity": "Hypothyroidism", "p-Value" :2.884273371},
	{"Comorbidity": "Neurological-Other", "p-Value" :8.904852769},
	{"Comorbidity": "Lymphoma", "p-Value" :4.900058234},
	{"Comorbidity": "Pulmonary Circulation Disorders", "p-Value" :0.906420422},
	{"Comorbidity": "Kidney Failure", "p-Value" :3.134495108},
	{"Comorbidity": "Chronic Pulmonary Disease", "p-Value" :2.501296975},
	{"Comorbidity": "Heart Failure", "p-Value" :1.68E+01},
	{"Comorbidity": "Coagulopathy", "p-Value" :3.897656936},
	{"Comorbidity": "Deficiency Anemia", "p-Value" :0.55117303},
	{"Comorbidity": "Metastatic Cancer", "p-Value" :1.63E+01},
	{"Comorbidity": "Drug Abuse", "p-Value" :2.40E-06},
	{"Comorbidity": "Blood Loss Anemia", "p-Value" :3.584863441}
    ],
  // The name of the data record attribute that contains x-values.
  xkey: 'Comorbidity',
  // A list of names of data record attributes that contain y-values.
  ykeys: ['p-Value'],
  // Labels for the ykeys -- will be displayed when you hover over the
  // chart.
  labels: [' - log(P)'],
  // font size
  gridTextSize: 20
});
