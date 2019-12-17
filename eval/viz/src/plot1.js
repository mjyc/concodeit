// Visualize overlap vs. repair iterations vs. method for synthetic data

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
  gray: "#7f7f7f"
};

const main = () => {
  const data = [
    {
      api: "WaitFor",
      wait_type: "WA",
      event_type: "AA",
      task: "WA-AA",
      num_blocks: 13
    },
    {
      api: "WaitFor",
      wait_type: "WA",
      event_type: "AE",
      task: "WA-AE",
      num_blocks: 9
    },
    {
      api: "WaitFor",
      wait_type: "WO",
      event_type: "AA",
      task: "WO-AA",
      num_blocks: 10
    },
    {
      api: "WaitFor",
      wait_type: "WO",
      event_type: "EE",
      task: "WO-EE",
      num_blocks: 7
    },
    {
      api: "WaitFor",
      wait_type: "WA",
      event_type: "EE",
      task: "WA-EE",
      num_blocks: 7
    },
    {
      api: "WaitFor",
      wait_type: "WO",
      event_type: "AE",
      task: "WO-AE",
      num_blocks: 9
    },
    {
      api: "Callback",
      wait_type: "WA",
      event_type: "AA",
      task: "WA-AA",
      num_blocks: 17
    },
    {
      api: "Callback",
      wait_type: "WO",
      event_type: "AA",
      task: "WO-AA",
      num_blocks: 17
    },
    {
      api: "Callback",
      wait_type: "WA",
      event_type: "EE",
      task: "WA-EE",
      num_blocks: 15
    },
    {
      api: "Callback",
      wait_type: "WA",
      event_type: "AE",
      task: "WA-AE",
      num_blocks: 16
    },
    {
      api: "Callback",
      wait_type: "WO",
      event_type: "EE",
      task: "WO-EE",
      num_blocks: 15
    },
    {
      api: "Callback",
      wait_type: "WO",
      event_type: "AE",
      task: "WO-AE",
      num_blocks: 16
    },
    {
      api: "Async",
      wait_type: "WA",
      event_type: "AA",
      task: "WA-AA",
      num_blocks: 17
    },
    {
      api: "Async",
      wait_type: "WA",
      event_type: "AE",
      task: "WA-AE",
      num_blocks: 18
    },
    {
      api: "Async",
      wait_type: "WO",
      event_type: "AA",
      task: "WO-AA",
      num_blocks: 12
    },
    {
      api: "Async",
      wait_type: "WO",
      event_type: "EE",
      task: "WO-EE",
      num_blocks: 14
    },
    {
      api: "Async",
      wait_type: "WA",
      event_type: "EE",
      task: "WA-EE",
      num_blocks: 15
    },
    {
      api: "Async",
      wait_type: "WO",
      event_type: "AE",
      task: "WO-AE",
      num_blocks: 17
    }
  ];

  const vlSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v4.json",
    data: {
      values: data
    },
    vconcat: data
      .map(x => x.api)
      .filter((x, i, arr) => arr.indexOf(x) === i)
      .map(api => ({
        title: api,
        transform: [
          {
            filter: {
              field: "api",
              equal: api
            }
          }
        ],
        mark: { type: "bar" },
        encoding: {
          column: { field: "event_type", type: "ordinal" },
          x: {
            field: "num_blocks",
            type: "quantitative"
            // aggregate: "mean"
          },
          y: { field: "wait_type", type: "ordinal" }
        }
      }))
  };

  vegaEmbed("#vis", vlSpec);
};

main();
