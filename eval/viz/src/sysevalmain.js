const tableau10 = {
  blue: "#1f77b4",
  orange: "#ff7f0e",
  red: "#d62728",
  cyan: "#17becf",
  green: "#2ca02c",
  lime: "#bcbd22",
  purple: "#9467bd",
  magenta: "#e377c2",
  brown: "#8c564b",
  gray: "#7f7f7f",
};

const main = (data) => {
  const vspecs = [
    {
      xField: "numBlocks",
      xScale: { domain: [0, 30] },
      xTitle: "Number of Blocks",
    },
    {
      xField: "functions",
      xScale: { domain: [0, 5] },
      xTitle: "Number of Functions",
    },
    {
      xField: "maxDepth",
      xScale: { domain: [0, 5] },
      xTitle: "Max Depth",
    },
    {
      xField: "numVariables",
      xScale: { domain: [0, 5] },
      xTitle: "Number of Variables",
    },
  ];
  const vlSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v4.json",
    data: {
      values: data,
    },
    transform: [
      {
        calculate:
          "(substring(datum.filename, 0, 1) == 'A') ? 'async' : (substring(datum.filename, 0, 1) == 'C') ? 'callback' : 'waitfor'",
        as: "api",
      },
    ],
    hconcat: [
      {
        vconcat: vspecs.map((vspec) => ({
          // height: 75,
          layer: [
            {
              mark: { type: "point", filled: true, color: "black" },
              encoding: {
                x: {
                  field: vspec.xField,
                  type: "quantitative",
                  aggregate: "mean",
                  scale: vspec.xScale,
                  title: vspec.xTitle,
                },
                y: { field: "api", type: "ordinal", title: null },
              },
            },
            {
              mark: {
                type: "errorbar",
                extent: "stdev",
              },
              encoding: {
                x: {
                  field: vspec.xField,
                  type: "quantitative",
                  aggregate: "mean",
                  title: vspec.xTitle,
                },
                y: { field: "api", type: "ordinal" },
              },
            },
          ],
        })),
      },
      {
        transform: [
          {
            fold: [
              "say",
              "text",
              "gesture",
              "controls_whileUntil_with_sleep",
              "logic_operation",
              "action_state",
              "sleep",
              "math_number",
              "text_isEmpty",
              "last_detected_event",
              "lists_create_with",
              "display_button",
              "pass",
              "variables_set",
              "logic_boolean",
              "when",
              "procedures_callnoreturn",
              "procedures_defnoreturn",
              "controls_if",
              "logic_negate",
              "variables_get",
              "wait_for_all",
              "wait_for_event",
              "wait_for_one",
            ],
          },
        ],
        layer: [
          {
            mark: { type: "point", filled: true, color: "black" },
            encoding: {
              x: {
                field: "value",
                type: "quantitative",
                aggregate: "mean",
              },
              y: {
                field: "key",
                type: "ordinal",
                title: null,
                // axis: { labelExpr: "datum.label[0]" },
                // sort: [
                //   "say",
                //   "text",
                //   "gesture",
                //   "controls_whileUntil_with_sleep",
                //   "logic_operation",
                //   "action_state",
                //   "sleep",
                //   "math_number",
                //   "text_isEmpty",
                //   "last_detected_event",
                //   "lists_create_with",
                //   "display_button",
                //   "pass",
                //   "variables_set",
                //   "logic_boolean",
                //   "when",
                //   "procedures_callnoreturn",
                //   "procedures_defnoreturn",
                //   "controls_if",
                //   "logic_negate",
                //   "variables_get",
                //   "wait_for_all",
                //   "wait_for_event",
                //   "wait_for_one",
                // ],
              },
            },
          },
          {
            mark: {
              type: "errorbar",
              extent: "stdev",
            },
            encoding: {
              x: {
                field: "value",
                type: "quantitative",
                aggregate: "mean",
              },
              y: {
                field: "key",
                type: "ordinal",
                title: null,
                // axis: { labelExpr: "datum.label[0]" },
                // sort: [
                //   "say",
                //   "text",
                //   "gesture",
                //   "controls_whileUntil_with_sleep",
                //   "logic_operation",
                //   "action_state",
                //   "sleep",
                //   "math_number",
                //   "text_isEmpty",
                //   "last_detected_event",
                //   "lists_create_with",
                //   "display_button",
                //   "pass",
                //   "variables_set",
                //   "logic_boolean",
                //   "when",
                //   "procedures_callnoreturn",
                //   "procedures_defnoreturn",
                //   "controls_if",
                //   "logic_negate",
                //   "variables_get",
                //   "wait_for_all",
                //   "wait_for_event",
                //   "wait_for_one",
                // ],
              },
            },
          },
        ],
      },
    ],
  };
  vegaEmbed("#vis", vlSpec);
};

fetch("/dist/sysevaldata.json")
  .then((response) => {
    return response.json();
  })
  .then((rawData) => {
    console.log(rawData);
    main(rawData);
  });
