interface CardProps {
  icons: React.ReactNode[];
  points: string[];
  title: string;
  description: string;
  buttonText: string;
}

const Card = (props: CardProps) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-lg w-full md:w-96">
      <h3 className="text-3xl font-bold mb-4">{props.title}</h3>
      <p className="text-xl mb-6 text-gray-400">{props.description}</p>
      <ul className="mb-8">
        {props.points.map((point, index) => (
          <div key={index} className="flex items-center mb-2">
            <div>{props.icons[index]}</div>
            <span>{point}</span>
          </div>
        ))}
      </ul>
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-xl transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
        {props.buttonText}
      </button>
    </div>
  );
};

export default Card;
