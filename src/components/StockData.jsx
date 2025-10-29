import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchStockData } from "../store/modules/commonSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PriceLineChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={["auto", "auto"]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="price" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

const StockData = () => {
  const dispatch = useDispatch();
  const stockAllData = useSelector((state) => state.common.stockAllData);

  useEffect(() => {
    dispatch(fetchStockData());
  }, [dispatch]);

  return (
    <div>
      <PriceLineChart data={stockAllData} />
    </div>
  );
};

export default StockData;
