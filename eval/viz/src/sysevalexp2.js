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
  data = data.map((d) => ({
    filename: d["filename"],
    numBlocks: d["numBlocks"],
    numFunctions: d["numFunctions"],
    numVariables: d["numVariables"],
    maxDepth: d["maxDepth"],
    robot_action_status: d["action_state"],
    robot_last_event: d["last_detected_event"],
    robot_say: d["say"],
    robot_gesture: d["gesture"],
    robot_display_button: d["display_button"],
    robot_sleep: d["sleep"],
    cci_when: d["when"],
    cci_wait_for_all: d["wait_for_all"],
    cci_wait_for_event: d["wait_for_event"],
    cci_wait_for_one: d["wait_for_one"],
    logic_boolean: d["logic_boolean"],
    logic_negate: d["logic_negate"],
    logic_operation: d["logic_operation"],
    controls_if: d["controls_if"],
    controls_while: d["controls_whileUntil_with_sleep"],
    math_number: d["math_number"],
    text: d["text"],
    text_isEmpty: d["text_isEmpty"],
    lists_create_with: d["lists_create_with"],
    variables_get: d["variables_get"],
    variables_set: d["variables_set"],
    procedures_callnoreturn: d["procedures_callnoreturn"],
    procedures_defnoreturn: d["procedures_defnoreturn"],
    pass: d["pass"],
    start_program: d["start_program"],
  }));
  const sort = [
    "robot_action_status",
    "robot_last_event",
    "robot_say",
    "robot_gesture",
    "robot_display_button",
    "robot_sleep",
    "cci_when",
    "cci_wait_for_all",
    "cci_wait_for_event",
    "cci_wait_for_one",
    "logic_boolean",
    "logic_negate",
    "logic_operation",
    "controls_if",
    "controls_while",
    "math_number",
    "text",
    "text_isEmpty",
    "lists_create_with",
    "variables_get",
    "variables_set",
    "procedures_callnoreturn",
    "procedures_defnoreturn",
    "pass",
    "start_program",
  ];
  const vspecs = [
    {
      xField: "numBlocks",
      xScale: { domain: [0, 30] },
      xTitle: "Average Number of Blocks",
    },
    {
      xField: "numFunctions",
      xScale: { domain: [0, 5] },
      xTitle: "Average Number of Functions",
    },
    {
      xField: "numVariables",
      xScale: { domain: [0, 5] },
      xTitle: "Average Number of Variables",
    },
    {
      xField: "maxDepth",
      xScale: { domain: [0, 5] },
      xTitle: "Average Max Depth",
    },
    {
      xField: "logic_boolean",
      xScale: { domain: [0, 5] },
      xTitle: "Average Number of Booleans",
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
          "(indexof(datum.filename, 'Async') != -1) ? 'async' : (indexof(datum.filename, 'Callback') != -1 ) ? 'callback' : 'waitfor'",
        as: "api",
      },
    ],
    hconcat: [
      {
        vconcat: vspecs.map((vspec) => ({
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
        height: 515,
        transform: [
          {
            fold: [
              "robot_action_status",
              "robot_last_event",
              "robot_say",
              "robot_gesture",
              "robot_display_button",
              "robot_sleep",
              "cci_when",
              "cci_wait_for_all",
              "cci_wait_for_event",
              "cci_wait_for_one",
              "logic_boolean",
              "logic_negate",
              "logic_operation",
              "controls_if",
              "controls_while",
              "math_number",
              "text",
              "text_isEmpty",
              "lists_create_with",
              "variables_get",
              "variables_set",
              "procedures_callnoreturn",
              "procedures_defnoreturn",
              "pass",
              "start_program",
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
                title: "Average Number of Blocks",
              },
              y: {
                field: "key",
                type: "ordinal",
                title: null,
                sort,
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
                title: "Average Number of Blocks",
              },
              y: {
                field: "key",
                type: "ordinal",
                title: null,
                sort,
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
    main(rawData);
  });
