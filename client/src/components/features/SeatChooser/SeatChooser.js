import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Progress, Alert } from 'reactstrap';
import { getSeats, loadSeatsRequest, getRequests, loadSeats } from '../../../redux/seatsRedux';
import io from 'socket.io-client';
import './SeatChooser.scss';


const SeatChooser = ({ chosenDay, chosenSeat, updateSeat }) => {
  const [socket, setSocket] = useState(null);
  const [freeSeats, setFreeSeats] = useState('');
  const dispatch = useDispatch();
  const seats = useSelector(getSeats);
  const requests = useSelector(getRequests);
  


  const isTaken = (seatId) => {
    return (seats.some(item => (item.seat === seatId && item.day === chosenDay)));
  }
  console.log('miejsca: ',seats, freeSeats)
  const prepareSeat = (seatId) => {
    if(seatId === chosenSeat) return <Button key={seatId} className="seats__seat" color="primary">{seatId}</Button>;
    else if(isTaken(seatId)) return <Button key={seatId} className="seats__seat" disabled color="secondary">{seatId}</Button>;
    else return <Button key={seatId} color="primary" className="seats__seat" outline onClick={(e) => updateSeat(e, seatId)}>{seatId}</Button>;
  }
  const updateFreeSeats = () => {
    const isChosenDay = seats.some((item) => item.day === chosenDay);
    if (isChosenDay) {
      const filtered = seats.filter((item) => item.day === chosenDay);
      setFreeSeats(50 - filtered.length);
    } else {
      setFreeSeats(50);
    }
  };

  useEffect(() => {
    dispatch(loadSeatsRequest());
    const newSocket = io((process.env.NODE_ENV === 'production') ? '/' : 'http://localhost:8000/');
    setSocket(newSocket);
    newSocket.on('seatsUpdated', (seats) => dispatch(loadSeats(seats)))
    updateFreeSeats();
  }, []);

  useEffect(() => {
    updateFreeSeats();}, [seats, chosenDay]);

  return (
    <div>
      <h3>Pick a seat</h3>
      <small id="pickHelp" className="form-text text-muted ml-2"><Button color="secondary" /> – seat is already taken</small>
      <small id="pickHelpTwo" className="form-text text-muted ml-2 mb-4"><Button outline color="primary" /> – it's empty</small>
      { (requests['LOAD_SEATS'] && requests['LOAD_SEATS'].success) && <div className="seats">{[...Array(50)].map((x, i) => prepareSeat(i+1) )}</div>}
      { (requests['LOAD_SEATS'] && requests['LOAD_SEATS'].pending) && <Progress animated color="primary" value={50} /> }
      { (requests['LOAD_SEATS'] && requests['LOAD_SEATS'].error) && <Alert color="warning">Couldn't load seats...</Alert> }
      <p>Free seats: {freeSeats}/50</p>
    </div>
  )
}

export default SeatChooser;