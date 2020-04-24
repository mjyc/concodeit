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
  data = {
    numBlocks: data["numBlocks"],
    numFunctions: data["numFunctions"],
    numVariables: data["numVariables"],
    maxDepth: data["maxDepth"],
    robot_action_status: data["action_state"],
    robot_last_event: data["last_detected_event"],
    robot_say: data["say"],
    robot_gesture: data["gesture"],
    robot_display_button: data["display_button"],
    robot_sleep: data["sleep"],
    cci_when: data["when"],
    cci_wait_for_all: data["wait_for_all"],
    cci_wait_for_event: data["wait_for_event"],
    cci_wait_for_one: data["wait_for_one"],
    logic_boolean: data["logic_boolean"],
    logic_negate: data["logic_negate"],
    logic_operation: data["logic_operation"],
    controls_if: data["controls_if"],
    controls_while: data["controls_whileUntil_with_sleep"],
    math_number: data["math_number"],
    text: data["text"],
    text_isEmpty: data["text_isEmpty"],
    lists_create_with: data["lists_create_with"],
    variables_get: data["variables_get"],
    variables_set: data["variables_set"],
    procedures_callnoreturn: data["procedures_callnoreturn"],
    procedures_defnoreturn: data["procedures_defnoreturn"],
    pass: data["pass"],
    start_program: data["start_program"],
  };
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
