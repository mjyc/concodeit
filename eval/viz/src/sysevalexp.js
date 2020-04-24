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
    console.log(rawData);
    main(rawData);
  });
