import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const Insights = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch real data from backend API
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const expenses = await response.json();

        // Convert API expense list → category totals
        const categoryTotals = {};

        expenses.forEach((exp) => {
          if (!categoryTotals[exp.category]) {
            categoryTotals[exp.category] = 0;
          }
          categoryTotals[exp.category] += exp.amount;
        });

        // Convert to chart-friendly format
        const formattedData = Object.keys(categoryTotals).map((cat) => ({
          category: cat,
          amount: categoryTotals[cat],
        }));

        setData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading insights:", error);
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [token]);

  if (loading) {
    return <Typography variant="h6">Loading insights...</Typography>;
  }

  if (data.length === 0) {
    return <Typography variant="h6">No expense data available.</Typography>;
  }

  const labels = data.map((item) => item.category);
  const amounts = data.map((item) => item.amount);

  // random colors for each category
  const colors = data.map(
    () =>
      `rgba(${Math.floor(Math.random() * 255)}, 
      ${Math.floor(Math.random() * 255)}, 
      ${Math.floor(Math.random() * 255)}, 0.6)`
  );

  // Bar Chart
  const barChartData = {
    labels,
    datasets: [
      {
        label: "Category-wise Spending",
        data: amounts,
        backgroundColor: colors,
      },
    ],
  };

  // Pie Chart
  const pieChartData = {
    labels,
    datasets: [
      {
        data: amounts,
        backgroundColor: colors,
      },
    ],
  };

  // Line Chart
  const lineChartData = {
    labels,
    datasets: [
      {
        label: "Spending Trend",
        data: amounts,
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Spending Insights 📊
      </Typography>

      <Grid container spacing={3}>
        {/* BAR CHART */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Category-wise Spending</Typography>
              <Bar data={barChartData} />
            </CardContent>
          </Card>
        </Grid>

        {/* PIE CHART */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Spending Distribution</Typography>
              <Pie data={pieChartData} />
            </CardContent>
          </Card>
        </Grid>

        {/* LINE CHART */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Spending Trend</Typography>
              <Line data={lineChartData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Insights;
