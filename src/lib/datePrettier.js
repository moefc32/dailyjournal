export default function datePrettier(timestamp) {
    if (!timestamp) return '-';

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
        return '-';
    }

    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    };

    let formattedDate = date.toLocaleString('en-US', options).trim();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return `${formattedDate} - ${formattedTime}`;
}
