function Card(props) {

    const classNames = {
        
    }

  return (
    <div className={`card ${props.className}`}>
      <h2>{props.title}</h2>
      <p>{props.content}</p>
    </div>
  );
}


export default Card;