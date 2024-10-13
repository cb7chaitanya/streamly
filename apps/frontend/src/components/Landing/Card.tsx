interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Card = (props: CardProps) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl shadow-lg">
      {props.icon}
      <h3 className="text-2xl font-bold mb-2">{props.title}</h3>
      <p className="text-gray-400">{props.description}</p>
    </div>
  );
};

export default Card;
