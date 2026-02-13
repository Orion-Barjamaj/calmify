import style from "./dashboard.module.css";

export default function Dashboard() {
  return <div className={style.container}>
    <h1>Welcome, <span>Name</span></h1>
  </div>;
}
