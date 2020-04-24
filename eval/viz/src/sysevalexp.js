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
      {
        calculate: "(indexof(datum.filename, 'WA') != -1) ? 'WA' : 'WO'",
        as: "cctype",
      },
      {
        calculate:
          "(indexof(datum.filename, 'AA') != -1) ? 'AA' : (indexof(datum.filename, 'AE') != -1) ? 'AE' : 'EE'",
        as: "eventtype",
      },
    ],
    layer: [
      {
        mark: { type: "point", filled: true, color: "black" },
        encoding: {
          x: {
            field: "numBlocks",
            type: "quantitative",
            aggregate: "mean",
          },
          y: { field: "eventtype", type: "ordinal" },
        },
      },
      {
        mark: {
          type: "errorbar",
          extent: "stdev",
        },
        encoding: {
          x: {
            field: "numBlocks",
            type: "quantitative",
            aggregate: "mean",
          },
          y: { field: "eventtype", type: "ordinal" },
        },
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
