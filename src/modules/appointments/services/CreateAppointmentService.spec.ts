import AppError from '@shared/errors/AppError';
import FakeAppointmentRepository from '../repositories/fakes/FakeAppointmentRepository';
import FakeNotificationsRepository from '../../notifications/repositories/fakes/FakeNotificationsRepository';

import CreateAppointmentService from './CreateAppointmentService';

let fakeAppointmentRepository: FakeAppointmentRepository;
let fakeNotificationsRepository: FakeNotificationsRepository;
let createAppointment: CreateAppointmentService;

describe('CreateAppointment', () => {
  beforeEach(() => {
    fakeAppointmentRepository = new FakeAppointmentRepository();
    fakeNotificationsRepository = new FakeNotificationsRepository();

    createAppointment = new CreateAppointmentService(
      fakeAppointmentRepository,
      fakeNotificationsRepository
    );
  });

  it('should be able to create a new Appointment', async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    const appointment = await createAppointment.execute({
      date: new Date(2020, 4, 10, 13),
      user_id: 'user-id',
      provider_id: 'provider-id',
    });

    expect(appointment).toHaveProperty('id');
    expect(appointment.provider_id).toBe('provider-id');
  });

  it('should not be able to create two Appointment on the same time', async () => {
    const appointmentDate = new Date(2020, 4, 19, 15);

    await createAppointment.execute({
      date: appointmentDate,
      user_id: 'user-id',
      provider_id: 'provider-id',
    });

    await expect(
      createAppointment.execute({
        date: appointmentDate,
        user_id: 'user-id',
        provider_id: 'provider-id',
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create Appointment on an past date', async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    await expect(
      createAppointment.execute({
        date: new Date(2020, 4, 10, 11),
        user_id: 'user-id',
        provider_id: 'provider-id',
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create Appointment with same user as provider', async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    await expect(
      createAppointment.execute({
        date: new Date(2020, 4, 10, 13),
        user_id: 'user-id',
        provider_id: 'user-id',
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create Appointment before 8am and after 5pm', async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    await expect(
      createAppointment.execute({
        date: new Date(2020, 4, 11, 7),
        user_id: 'user-id',
        provider_id: 'provider-id',
      })
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      createAppointment.execute({
        date: new Date(2020, 4, 11, 18),
        user_id: 'user-id',
        provider_id: 'provider-id',
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
