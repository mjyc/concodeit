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
  data = data
    .filter((d) => d["filename"] !== "a04.xml" && d["filename"] !== "c06.xml")
    .map((d) => ({
      filename: d["filename"],
      numTotalBlocks: d["numTotalBlocks"],
      numFunctions: d["numFunctions"],
      numVariables: d["numVariables"],
      numBranches: d["numBranches"],
      numLoops: d["numLoops"],
      numConds: d["numConds"],
    }));
  const vlSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v4.json",
    data: {
      values: data,
    },
    transform: [
      {
        calculate:
          "(substring(datum.filename, 0, 1) == 'a') ? 'async' : (substring(datum.filename, 0, 1) == 'c' ) ? 'callback' : 'waitfor'",
        as: "api",
      },
    ],
    hconcat: [
      {
        vconcat: [
          {
            xField: "numTotalBlocks",
            xScale: { domain: [0, 120] },
            xTitle: "Average Number of Blocks",
          },
          {
            xField: "numFunctions",
            xScale: { domain: [-2, 12] },
            xTitle: "Average Number of Functions",
          },
          {
            xField: "numVariables",
            xScale: { domain: [-2, 12] },
            xTitle: "Average Number of Variables",
          },
        ].map((vspec) => ({
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
        vconcat: [
          {
            xField: "numBranches",
            xScale: { domain: [-2, 12] },
            xTitle: "Average Number of Branches",
          },
          {
            xField: "numLoops",
            xScale: { domain: [-2, 12] },
            xTitle: "Average Number of Loops",
          },
          {
            xField: "numConds",
            xScale: { domain: [-2, 12] },
            xTitle: "Average Number of Conditions",
          },
        ].map((vspec) => ({
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
    ],
  };
  vegaEmbed("#vis", vlSpec);
};

fetch("/dist/userstudydata.json")
  .then((response) => {
    return response.json();
  })
  .then((rawData) => {
    main(rawData);
  });
