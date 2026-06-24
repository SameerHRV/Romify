import { useParams } from "react-router";

const VisualizerId = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Visualizer: {id}</h1>
    </div>
  );
};

export default VisualizerId;
