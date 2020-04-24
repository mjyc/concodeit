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
    hconcat: [
      {
        vconcat: [
          {
            filter: 'datum.api == "async"',
            xField: "numBlocks",
            xScale: { domain: [0, 25] },
            xTitle: "Average Number of Blocks",
            yField: "cctype",
          },
          {
            filter: 'datum.api == "callback"',
            xField: "numBlocks",
            xScale: { domain: [0, 25] },
            xTitle: "Average Number of Blocks",
            yField: "cctype",
          },
          {
            filter: 'datum.api == "waitfor"',
            xField: "numBlocks",
            xScale: { domain: [0, 25] },
            xTitle: "Average Number of Blocks",
            yField: "cctype",
          },
        ].map((vspec) => ({
          // height: 60,
          transform: [
            {
              filter: vspec.filter,
            },
          ],
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
                y: { field: vspec.yField, type: "ordinal", title: null },
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
                y: { field: vspec.yField, type: "ordinal" },
              },
            },
          ],
        })),
      },
      {
        vconcat: [
          {
            filter: 'datum.api == "async"',
            xField: "numBlocks",
            xScale: { domain: [0, 25] },
            xTitle: "Average Number of Blocks",
            yField: "eventtype",
          },
          {
            filter: 'datum.api == "callback"',
            xField: "numBlocks",
            xScale: { domain: [0, 25] },
            xTitle: "Average Number of Blocks",
            yField: "eventtype",
          },
          {
            filter: 'datum.api == "waitfor"',
            xField: "numBlocks",
            xScale: { domain: [0, 25] },
            xTitle: "Average Number of Blocks",
            yField: "eventtype",
          },
        ].map((vspec) => ({
          // height: 60,
          transform: [
            {
              filter: vspec.filter,
            },
          ],
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
                y: { field: vspec.yField, type: "ordinal", title: null },
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
                y: { field: vspec.yField, type: "ordinal" },
              },
            },
          ],
        })),
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
