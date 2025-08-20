const DefaultAvatar = ({
  name,
  inModal = false,
}: {
  name: string;
  inModal?: boolean;
}) => {
  const containerSize = inModal ? "w-28 h-28  text-2xl" : "w-10 h-10";
  return (
    <div
      className={`${containerSize} rounded-full  bg-neutral text-neutral-content flex items-center justify-center`}
    >
      <div className=" w-full h-full flex items-center justify-center ">
        {name?.charAt(0).toUpperCase() ?? "?"}
      </div>
    </div>
  );
};

export default DefaultAvatar;
